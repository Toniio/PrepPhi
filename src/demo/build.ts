import { describeFacts } from '@/coach/context'
import { applyCoachReply } from '@/coach/plan'
import type { WeeklyPlanReply } from '@/coach/prompts'
import {
  getStep,
  initialElliptical,
  LADDERS,
  nextWeek,
  placeAtLevel,
  previousWeek,
  reviewFacts,
  today as localToday,
  weekDates,
  weekday,
  weekId as weekOf,
  weekStart,
  type CardioEntry,
  type EllipticalChange,
  type ExerciseResult,
  type IsoDate,
  type LadderState,
  type LadderStep,
  type PlannedSession,
  type ReviewFacts,
  type WeekId,
} from '@/engine'
import { mergeCardio } from '@/import/garmin'
import {
  addChatTurn,
  addProposals,
  applyNextWeek,
  checkIn,
  decideProposal,
  decideStepUp,
  ensureWeek,
  logElliptical,
  markInCalendar,
  missSession,
  ruleNextWeek,
} from '@/model/actions'
import { emptyData, type AppData } from '@/model/schema'
import {
  ACCESSORIES,
  demoProfile,
  ELLIPTICAL_HR,
  handstandHolds,
  performanceOf,
  PROPOSALS,
  REVIEW_CHATS,
  START_LEVELS,
  TRIP_DAYS,
  type Mode,
} from './script'

// Three weeks of fictional use, produced by the real rules engine: the plan
// of each week comes from the planner, each check-in goes through the
// progression rules, each review applies its decisions and plans the next
// week. So the data is as consistent as data the app wrote itself.
//
// The three weeks end with the last one whose review is due: the week before
// today, or the current week on Sunday, the review day. The first two reviews
// are done; the last is still to do, and the following week holds the plan
// the rules made.
//
// Only exercises with an animation appear: the profile carries `demo`, which
// makes the planner skip the hors-dataset steps (src/model/actions.ts).

const WEEKS = 3

function valuesFor(step: LadderStep, targets: number[], mode: Mode): number[] {
  if (mode === 'top') return targets.map(() => step.range[1])
  if (mode === 'short') return targets.map((t, i) => (i === targets.length - 1 ? Math.max(step.range[0], t - 1) : t))
  return [...targets]
}

function initialStates(): Record<string, LadderState> {
  return Object.fromEntries(
    LADDERS.map((ladder) => {
      const start = START_LEVELS[ladder.id] ?? { level: 1 }
      const state = placeAtLevel(ladder.id, start.level, start.unlocked)
      return [ladder.id, start.lastValues ? { ...state, lastValues: start.lastValues } : state]
    }),
  )
}

type Counters = {
  /** Sessions of each ladder since the start, and in the week being played. */
  nth: Record<string, number>
  inWeek: Record<string, number>
}

function garminEntry(
  session: PlannedSession,
  seed: number,
  avgHr: number,
  durationMin: number,
  type: string,
): CardioEntry {
  const minute = String(30 + (seed % 25)).padStart(2, '0')
  return {
    id: `${session.date} 18:${minute}:${String(10 + seed).padStart(2, '0')}`,
    date: session.date,
    type,
    durationMin,
    avgHr,
    maxHr: avgHr + (type === 'Elliptical' ? 17 : 38),
    calories: Math.round(durationMin * (type === 'Elliptical' ? 8.7 : 6.4)),
    resistance: null,
    rpe: null,
  }
}

function withGarmin(data: AppData, entry: CardioEntry): AppData {
  return { ...data, cardioLog: mergeCardio(data.cardioLog, [entry]).log }
}

function abandon(data: AppData, weekId: WeekId, sessionId: string): AppData {
  const week = data.weeks[weekId]
  const sessions = week.plan.sessions.map((s) => (s.id === sessionId ? { ...s, status: 'abandoned' as const } : s))
  return { ...data, weeks: { ...data.weeks, [weekId]: { ...week, plan: { ...week.plan, sessions } } } }
}

function playStrength(
  data: AppData,
  weekId: WeekId,
  week: number,
  session: PlannedSession,
  counters: Counters,
  seed: number,
): AppData {
  const results: ExerciseResult[] = session.exercises.map((exercise) => {
    const state = data.ladderState[exercise.ladderId]
    const step = getStep(exercise.ladderId, state.level)
    const performance = performanceOf({
      ladderId: exercise.ladderId,
      level: state.level,
      week,
      nth: counters.nth[exercise.ladderId] ?? 0,
      nthInWeek: counters.inWeek[exercise.ladderId] ?? 0,
    })
    counters.nth[exercise.ladderId] = (counters.nth[exercise.ladderId] ?? 0) + 1
    counters.inWeek[exercise.ladderId] = (counters.inWeek[exercise.ladderId] ?? 0) + 1
    return {
      ladderId: exercise.ladderId,
      level: exercise.level,
      values: exercise.cumulative
        ? handstandHolds(state.targets[0])
        : valuesFor(step, state.targets.slice(0, exercise.sets), performance.mode),
      feeling: performance.feeling,
      pain: false,
    }
  })
  const next = checkIn(data, { weekId, sessionId: session.id, date: session.date, results }).data
  const hr = 108 + (seed % 5) * 2
  return withGarmin(
    next,
    garminEntry(session, seed, hr, session.durationMin, session.kind === 'nomad' ? 'HIIT' : 'Strength Training'),
  )
}

function playElliptical(
  data: AppData,
  weekId: WeekId,
  week: number,
  session: PlannedSession,
  index: number,
  seed: number,
): AppData {
  const cardio = session.cardio!
  const logged = logElliptical(data, {
    weekId,
    sessionId: session.id,
    date: session.date,
    durationMin: cardio.durationMin,
    rpe: 4,
    resistance: cardio.resistance,
  })
  // The Garmin import then brings the heart rate and takes the manual entry's effort.
  const hr = ELLIPTICAL_HR[week][Math.min(index, 1)]
  return withGarmin(logged, garminEntry(session, seed, hr, cardio.durationMin, 'Elliptical'))
}

/** One week as lived: every planned session done, but the ones the story skips. */
function playWeek(
  data: AppData,
  weekId: WeekId,
  week: number,
  counters: Counters,
  seed: number,
  until: IsoDate | null,
): AppData {
  counters.inWeek = {}
  let strengthSeen = 0
  let ellipticalSeen = 0
  let next = data
  for (const date of weekDates(weekId)) {
    // The review day: today's sessions are still to do.
    if (until !== null && date >= until) break
    for (const session of next.weeks[weekId].plan.sessions.filter((s) => s.date === date && s.status === 'planned')) {
      seed += 1
      if (session.kind === 'elliptical') {
        ellipticalSeen += 1
        // Trip week: the second elliptical session is skipped, and no day is left to move it to.
        if (week === 1 && ellipticalSeen === 2) {
          next = abandon(next, weekId, session.id)
        } else {
          next = playElliptical(next, weekId, week, session, ellipticalSeen - 1, seed)
        }
        continue
      }
      strengthSeen += 1
      // Last week: the second session is missed and slides to a free day, as "Reporter" does.
      if (week === 2 && strengthSeen === 2) {
        next = missSession(next, { weekId, sessionId: session.id, today: date }).data
        continue
      }
      next = playStrength(next, weekId, week, session, counters, seed)
    }
  }
  return next
}

function ellipticalSentence(changes: EllipticalChange[]): string {
  const parts = changes.flatMap((c) => {
    if (c.type === 'duration') return [`l’elliptique passe de ${c.from} à ${c.to} minutes`]
    if (c.type === 'resistance') return [`la résistance passe de ${c.from} à ${c.to}`]
    return []
  })
  return parts.length ? `${parts[0].charAt(0).toUpperCase()}${parts[0].slice(1)}.` : ''
}

function summaryOf(facts: ReviewFacts, changes: EllipticalChange[], accepted: number): string {
  const lines = describeFacts(facts).slice(0, 3)
  const closing = accepted > 0 ? 'Tu as accepté le palier suivant : il démarre au bas de sa fourchette.' : ''
  return [...lines, ellipticalSentence(changes), closing].filter(Boolean).join(' ')
}

/** Sunday evening: decisions applied, next week planned, coach's answer and conversation stored. */
function review(data: AppData, weekId: WeekId, week: number): AppData {
  const sunday = weekDates(weekId)[6]
  const now = `${sunday}T20:05:00.000Z`
  const doc = data.weeks[weekId]
  const facts = reviewFacts({
    plan: doc.plan,
    logs: doc.logs,
    events: doc.events.map((e) => e.event),
    states: data.ladderState,
    cardio: data.cardioLog,
  })

  let next = data
  for (const proposed of facts.stepUps) next = decideStepUp(next, proposed.ladderId, true)

  const target = nextWeek(weekId)
  const days = weekDates(target)
  const trips = week === 0 ? [{ from: days[TRIP_DAYS[0] - 1], to: days[TRIP_DAYS[1] - 1] }] : []
  const rules = ruleNextWeek(next, { weekId, deload: false, trips })

  const calisthenics = rules.plan.sessions.filter((s) => s.kind === 'calisthenics')
  const nomad = rules.plan.sessions.find((s) => s.kind === 'nomad')
  const reply: WeeklyPlanReply = {
    summary: summaryOf(facts, rules.changes, facts.stepUps.length),
    cumulativeSummary: '',
    notes: [
      ...(nomad
        ? [
            {
              sessionId: nomad.id,
              note: 'Séance nomade : 20 à 30 minutes, sans tirage. Le circuit en chambre fait le cardio.',
            },
          ]
        : []),
      ...calisthenics.slice(0, 1).map((s) => ({
        sessionId: s.id,
        note:
          week === 0
            ? 'Vise le haut de la fourchette sur la poussée, deux séries propres valent mieux que trois bâclées.'
            : 'Retour à la maison : garde les cibles de tirage, pas de rattrapage.',
      })),
    ],
    accessories: calisthenics.flatMap((s) =>
      ACCESSORIES[s.title === 'Séance A' ? 'A' : 'B'].map((a) => ({ sessionId: s.id, unit: 'reps' as const, ...a })),
    ),
    proposals: [PROPOSALS[week]],
  }
  const cumulativeLine = `S${weekId.split('-W')[1]} : ${describeFacts(facts)[0]}${ellipticalSentence(rules.changes) ? ` ${ellipticalSentence(rules.changes)}` : ''}`
  const cumulative = [next.reviewSummary?.text, cumulativeLine]
    .filter(Boolean)
    .join('\n')
    .split('\n')
    .slice(-10)
    .join('\n')
  const applied = applyCoachReply(rules.plan, reply, next.profile!)

  next = applyNextWeek(next, {
    reviewWeek: weekId,
    plan: applied.plan,
    elliptical: rules.elliptical,
    summary: reply.summary,
    cumulative,
    now,
  })
  next = markInCalendar(
    next,
    target,
    applied.plan.sessions.map((s) => s.id),
  )
  next = addProposals(next, [PROPOSALS[week]], now)
  // The first proposal was accepted; the second waits for an answer.
  if (week === 0) next = decideProposal(next, `${now}-0`, true)
  return conversation(next, weekId, week, sunday)
}

function conversation(data: AppData, weekId: WeekId, week: number, sunday: IsoDate): AppData {
  const chat = REVIEW_CHATS[week]
  const next = addChatTurn(data, weekId, { role: 'user', content: chat.question, at: `${sunday}T20:01:00.000Z` })
  return addChatTurn(next, weekId, { role: 'assistant', content: chat.answer, at: `${sunday}T20:01:20.000Z` })
}

/** Fictional demo data: three weeks of use up to `today`, the week after planned. */
export function buildDemoData(today: IsoDate = localToday()): AppData {
  const current = weekOf(today)
  // The Review screen takes the current week on Sunday and the previous one otherwise.
  const sunday = weekday(today) === 7
  const last = sunday ? current : previousWeek(current)
  const weeks = Array.from({ length: WEEKS }, (_, i) => previousWeek(last, WEEKS - 1 - i))
  const start = weekStart(weeks[0])
  const profile = demoProfile(start)

  let data: AppData = {
    ...emptyData(),
    profile,
    ladderState: initialStates(),
    elliptical: initialElliptical(profile),
  }
  // The first week is planned by the rules the day the profile is created.
  data = ensureWeek(data, start)
  data = markInCalendar(
    data,
    weeks[0],
    data.weeks[weeks[0]].plan.sessions.map((s) => s.id),
  )

  const counters: Counters = { nth: {}, inWeek: {} }
  weeks.forEach((weekId, week) => {
    data = playWeek(data, weekId, week, counters, week * 10, sunday && week === WEEKS - 1 ? today : null)
    if (week < WEEKS - 1) data = review(data, weekId, week)
  })
  // The last review is still to do, with a first question already asked.
  data = conversation(data, weeks[WEEKS - 1], WEEKS - 1, weekDates(weeks[WEEKS - 1])[6])
  return ensureWeek(data, today)
}
