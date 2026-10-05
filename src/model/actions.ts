import { isAvailable, isAvailableWithAnimation } from '@/catalog'
import {
  acceptStepUp,
  applyResult,
  declineStepUp,
  familyOf,
  initialElliptical,
  isElliptical,
  lowZone,
  nextWeek,
  nomadSession,
  placeLadders,
  plannedExercise,
  planWeek,
  reenter,
  rescheduleMissed,
  stepElliptical,
  unlockLadders,
  weekDates,
  weekId as weekOf,
  type CardioEntry,
  type EllipticalChange,
  type ExerciseResult,
  type Family,
  type IsoDate,
  type LadderState,
  type MissedOutcome,
  type PlannedExercise,
  type PlannedSession,
  type Profile,
  type ProgressionEvent,
  type Trip,
  type WeekId,
  type WeekPlan,
} from '@/engine'
import type { AppData, ChatTurn, ReviewRecord, WeekDoc } from './schema'

// Pure reducers: each returns a new AppData, replacing only the documents it
// changes (saveChanges writes those).

/** Fictional demo data only plans exercises with an animation. */
function availabilityOf(data: AppData) {
  return data.profile?.demo ? isAvailableWithAnimation : isAvailable
}

function planInput(data: AppData, weekId: WeekId, trips: Trip[], deload: boolean) {
  const profile = data.profile!
  return {
    weekId,
    profile,
    states: data.ladderState,
    trips,
    deload,
    elliptical: data.elliptical ?? initialElliptical(profile),
    hrZone: lowZone(profile),
    available: availabilityOf(data),
    wallWhileTravelling: false,
  }
}

/** Sessions of a fresh plan that fall before `today` are dropped. */
function fromToday(plan: WeekPlan, today: IsoDate): WeekPlan {
  return { ...plan, sessions: plan.sessions.filter((s) => s.date >= today) }
}

/**
 * Planned sessions freeze their targets when the week is planned; a check-in
 * then moves the ladders. Brings the exercises of the sessions still `planned`
 * back in line with `data.ladderState`, with the planner's own rules (fallback
 * step, deload sets). Done, missed and abandoned sessions are history. An
 * exercise its ladder no longer plans (paused, no step doable there) is kept.
 */
function refreshPlanned(data: AppData, plan: WeekPlan): WeekPlan {
  const input = planInput(data, plan.weekId, plan.trips, plan.deload)
  const refresh = (context: PlannedSession['context']) => (exercise: PlannedExercise) => {
    const state = data.ladderState[exercise.ladderId]
    const fresh = state && plannedExercise(state, context, input)
    return fresh ? { ...exercise, ...fresh } : exercise
  }
  return {
    ...plan,
    sessions: plan.sessions.map((s) =>
      s.status === 'planned' ? { ...s, exercises: s.exercises.map(refresh(s.context)) } : s,
    ),
  }
}

function withWeek(data: AppData, week: WeekDoc): AppData {
  return { ...data, weeks: { ...data.weeks, [week.plan.weekId]: week } }
}

function updateSession(plan: WeekPlan, id: string, patch: Partial<PlannedSession>): WeekPlan {
  return { ...plan, sessions: plan.sessions.map((s) => (s.id === id ? { ...s, ...patch } : s)) }
}

// -- Onboarding ----------------------------------------------------------------

export function completeOnboarding(
  data: AppData,
  input: { profile: Profile; tested: Record<string, Record<number, number>>; today: IsoDate },
): AppData {
  const ladderState = placeLadders(input.tested)
  const elliptical = initialElliptical(input.profile)
  const next = { ...data, profile: input.profile, ladderState, elliptical }
  const weekId = weekOf(input.today)
  const plan = fromToday(planWeek(planInput(next, weekId, [], false)), input.today)
  return withWeek(next, { plan, logs: [], events: [] })
}

/**
 * The onboarding done again, over existing data. The history stays (past
 * weeks, check-ins, cardio, reviews, proposals); the answers replace the
 * profile, and only the ladders the new test session placed change level: a
 * ladder left blank keeps its step, its targets and its streaks. The rest of
 * the current week is planned again from today, what is done stays.
 */
export function redoOnboarding(
  data: AppData,
  input: { profile: Profile; tested: Record<string, Record<number, number>>; today: IsoDate },
): AppData {
  const placed = placeLadders(input.tested)
  const merged = { ...data.ladderState }
  for (const id of Object.keys(input.tested)) merged[id] = placed[id]
  // The new placement may open a skill; none closes again.
  const ladderState = unlockLadders(merged).states
  // The profile keeps its creation date and, in the demo, its flag.
  const profile: Profile = {
    ...input.profile,
    createdAt: data.profile?.createdAt ?? input.profile.createdAt,
    ...(data.profile?.demo ? { demo: true } : {}),
  }
  // The elliptical progress stays, within the resistance range given again.
  const current = data.elliptical ?? initialElliptical(profile)
  const { min, max } = profile.ellipticalResistance
  const elliptical = { ...current, resistance: Math.min(max, Math.max(min, current.resistance)) }
  const next: AppData = { ...data, profile, ladderState, elliptical }

  const weekId = weekOf(input.today)
  const week = next.weeks[weekId]
  const trips = week?.plan.trips.filter((t) => t.confirmed) ?? []
  const replanned = planWeek(planInput(next, weekId, trips, week?.plan.deload ?? false))
  const kept = week ? week.plan.sessions.filter((s) => s.date < input.today || s.status !== 'planned') : []
  const fresh = replanned.sessions.filter(
    (s) => s.date >= input.today && !kept.some((k) => k.date === s.date && k.kind === s.kind),
  )
  const plan: WeekPlan = {
    ...(week?.plan ?? replanned),
    sessions: [...kept, ...fresh].sort((a, b) => a.date.localeCompare(b.date) || a.kind.localeCompare(b.kind)),
  }
  return withWeek(next, { plan, logs: week?.logs ?? [], events: week?.events ?? [] })
}

/** The current week always has a plan: the rule-based one when no review planned it. */
export function ensureWeek(data: AppData, today: IsoDate): AppData {
  const weekId = weekOf(today)
  if (!data.profile || data.weeks[weekId]) return data
  const plan = fromToday(planWeek(planInput(data, weekId, [], false)), today)
  return withWeek(data, { plan, logs: [], events: [] })
}

// -- Check-in --------------------------------------------------------------------

/**
 * Records a strength session: applies every result to its ladder, unlocks
 * skills, and refreshes the exercises of the week's sessions still planned.
 */
export function checkIn(
  data: AppData,
  input: { weekId: WeekId; sessionId: string; date: IsoDate; results: ExerciseResult[] },
): { data: AppData; events: ProgressionEvent[]; unlocked: string[] } {
  const week = data.weeks[input.weekId]
  const session = week.plan.sessions.find((s) => s.id === input.sessionId)
  if (!session) throw new Error(`No session ${input.sessionId}`)

  let states = { ...data.ladderState }
  const events: ProgressionEvent[] = []
  for (const result of input.results) {
    const state = states[result.ladderId]
    if (!state) continue
    const outcome = applyResult(state, result, { deload: week.plan.deload, date: input.date })
    states[result.ladderId] = outcome.state
    events.push(...outcome.events)
  }
  const unlock = unlockLadders(states)
  states = unlock.states

  const updated: AppData = { ...data, ladderState: states }
  const next: WeekDoc = {
    plan: refreshPlanned(updated, updateSession(week.plan, session.id, { status: 'done' })),
    logs: [...week.logs, { sessionId: session.id, date: input.date, kind: session.kind, results: input.results }],
    events: [...week.events, ...events.map((event) => ({ date: input.date, event }))],
  }
  return { data: withWeek(updated, next), events, unlocked: unlock.unlocked }
}

/** Records an elliptical session by hand; a Garmin import later fills the heart rate. */
export function logElliptical(
  data: AppData,
  input: {
    weekId: WeekId
    sessionId: string
    date: IsoDate
    durationMin: number
    rpe: number
    resistance: number | null
  },
): AppData {
  const week = data.weeks[input.weekId]
  const entry: CardioEntry = {
    id: `${input.date} manual`,
    date: input.date,
    type: 'Elliptical',
    durationMin: input.durationMin,
    avgHr: null,
    maxHr: null,
    calories: null,
    resistance: input.resistance,
    rpe: input.rpe,
  }
  const cardioLog = [...data.cardioLog.filter((e) => e.id !== entry.id), entry].sort((a, b) => a.id.localeCompare(b.id))
  const plan = updateSession(week.plan, input.sessionId, { status: 'done' })
  return withWeek({ ...data, cardioLog }, { ...week, plan })
}

/** Corrects the perceived effort or the resistance of a cardio entry. */
export function updateCardio(
  data: AppData,
  id: string,
  patch: Partial<Pick<CardioEntry, 'rpe' | 'resistance'>>,
): AppData {
  return { ...data, cardioLog: data.cardioLog.map((e) => (e.id === id ? { ...e, ...patch } : e)) }
}

// -- Missed sessions and travel ------------------------------------------------------

export function missSession(
  data: AppData,
  input: { weekId: WeekId; sessionId: string; today: IsoDate },
): { data: AppData; outcome: MissedOutcome } {
  const week = data.weeks[input.weekId]
  const trips = week.plan.trips.filter((t) => t.confirmed)
  const { plan, outcome } = rescheduleMissed(week.plan, input.sessionId, input.today, trips, (_, date) =>
    nomadSession(date, { states: data.ladderState, deload: week.plan.deload, available: availabilityOf(data) }),
  )
  return { data: withWeek(data, { ...week, plan }), outcome }
}

/**
 * "Je suis en déplacement": today's planned sessions give way to the nomad
 * version; switched off, today goes back to what the rules plan for it.
 */
export function setTravelToday(data: AppData, input: { weekId: WeekId; date: IsoDate; on: boolean }): AppData {
  const week = data.weeks[input.weekId]
  const isToday = (s: PlannedSession) => s.date === input.date && s.status === 'planned'
  const others = week.plan.sessions.filter((s) => !isToday(s))
  const covers = (t: Trip) => t.from <= input.date && t.to >= input.date
  const trips = input.on
    ? [...week.plan.trips.filter((t) => !covers(t)), { from: input.date, to: input.date, confirmed: true }]
    : week.plan.trips.filter((t) => !covers(t))

  let todays: PlannedSession[]
  if (input.on) {
    todays = [
      nomadSession(input.date, { states: data.ladderState, deload: week.plan.deload, available: availabilityOf(data) }),
    ]
  } else {
    const confirmed = trips.filter((t) => t.confirmed)
    const replanned = planWeek(planInput(data, input.weekId, confirmed, week.plan.deload))
    todays = replanned.sessions.filter((s) => s.date === input.date && !others.some((o) => o.id === s.id))
  }
  const sessions = [...others, ...todays].sort((a, b) => a.date.localeCompare(b.date) || a.kind.localeCompare(b.kind))
  return withWeek(data, { ...week, plan: { ...week.plan, trips, sessions } })
}

/** Trips confirmed from the calendar: the rest of the week is planned again around them. */
export function confirmTrips(data: AppData, input: { weekId: WeekId; trips: Trip[]; today: IsoDate }): AppData {
  const week = data.weeks[input.weekId]
  const trips = input.trips.map((t) => ({ ...t, confirmed: true }))
  const replanned = planWeek(planInput(data, input.weekId, trips, week.plan.deload))
  const kept = week.plan.sessions.filter((s) => s.date < input.today || s.status !== 'planned')
  const fresh = replanned.sessions.filter(
    (s) => s.date >= input.today && !kept.some((k) => k.date === s.date && k.kind === s.kind),
  )
  return withWeek(data, {
    ...week,
    plan: {
      ...week.plan,
      trips,
      sessions: [...kept, ...fresh].sort((a, b) => a.date.localeCompare(b.date) || a.kind.localeCompare(b.kind)),
    },
  })
}

// -- Review ------------------------------------------------------------------------

export function decideStepUp(data: AppData, ladderId: string, accept: boolean): AppData {
  const state = data.ladderState[ladderId]
  if (!state) return data
  const next = accept ? acceptStepUp(state) : declineStepUp(state)
  return { ...data, ladderState: { ...data.ladderState, [ladderId]: next } }
}

function mapFamily(data: AppData, family: Family, f: (s: LadderState) => LadderState): AppData {
  const ladderState = Object.fromEntries(
    Object.entries(data.ladderState).map(([id, s]) => [id, familyOf(id) === family ? f(s) : s]),
  )
  return { ...data, ladderState }
}

/** Recurring pain: the family pauses until Anthony reactivates it. */
export function pauseFamily(data: AppData, family: Family): AppData {
  return mapFamily(data, family, (s) => ({ ...s, paused: true }))
}

/** Clears the pain freeze and the pause of a family. */
export function reactivateFamily(data: AppData, family: Family): AppData {
  return mapFamily(data, family, (s) => ({ ...s, paused: false, frozen: false }))
}

/** A re-entry week after a long break: back one step on the ladders named. */
export function reenterLadders(data: AppData, ladderIds: string[]): AppData {
  const ladderState = { ...data.ladderState }
  for (const id of ladderIds) if (ladderState[id]) ladderState[id] = reenter(ladderState[id])
  return { ...data, ladderState }
}

/** The elliptical endurance sessions of a week, for its weekly step. */
export function ellipticalWeek(data: AppData, weekId: WeekId): CardioEntry[] {
  const dates = new Set(weekDates(weekId))
  return data.cardioLog.filter((e) => isElliptical(e) && dates.has(e.date))
}

/**
 * The rule-based plan of the week after `weekId`, with the elliptical step
 * the week earned. The coach arbitrates it before Anthony validates.
 */
export function ruleNextWeek(
  data: AppData,
  input: { weekId: WeekId; deload: boolean; trips: Trip[] },
): { plan: WeekPlan; elliptical: NonNullable<AppData['elliptical']>; changes: EllipticalChange[] } {
  const profile = data.profile!
  const current = data.elliptical ?? initialElliptical(profile)
  const { state: elliptical, changes } = stepElliptical({
    state: current,
    week: ellipticalWeek(data, input.weekId),
    zone: lowZone(profile),
    maxResistance: profile.ellipticalResistance.max,
    deload: data.weeks[input.weekId]?.plan.deload ?? false,
  })
  const target = nextWeek(input.weekId)
  const plan = planWeek({ ...planInput({ ...data, elliptical }, target, input.trips, input.deload) })
  return { plan, elliptical, changes }
}

/** Anthony validated next week's plan at the review. */
export function applyNextWeek(
  data: AppData,
  input: {
    reviewWeek: WeekId
    plan: WeekPlan
    elliptical: NonNullable<AppData['elliptical']>
    summary: string
    cumulative: string | null
    now: string
  },
): AppData {
  const review = data.reviews[input.reviewWeek] ?? emptyReview(input.reviewWeek)
  const next = withWeek(
    {
      ...data,
      elliptical: input.elliptical,
      reviews: { ...data.reviews, [input.reviewWeek]: { ...review, summary: input.summary, planned: true } },
      reviewSummary: input.cumulative
        ? { text: input.cumulative, throughWeek: input.reviewWeek, updatedAt: input.now }
        : data.reviewSummary,
    },
    {
      plan: input.plan,
      logs: data.weeks[input.plan.weekId]?.logs ?? [],
      events: data.weeks[input.plan.weekId]?.events ?? [],
    },
  )
  return next
}

export function emptyReview(weekId: WeekId): ReviewRecord {
  return { weekId, summary: null, messages: [], planned: false }
}

export function addChatTurn(data: AppData, weekId: WeekId, turn: ChatTurn): AppData {
  const review = data.reviews[weekId] ?? emptyReview(weekId)
  return { ...data, reviews: { ...data.reviews, [weekId]: { ...review, messages: [...review.messages, turn] } } }
}

/** The sessions created in the calendar after Anthony's validation. */
export function markInCalendar(data: AppData, weekId: WeekId, sessionIds: string[]): AppData {
  const week = data.weeks[weekId]
  if (!week) return data
  const ids = new Set(sessionIds)
  const sessions = week.plan.sessions.map((s) => (ids.has(s.id) ? { ...s, inCalendar: true } : s))
  return withWeek(data, { ...week, plan: { ...week.plan, sessions } })
}

// -- Proposals and profile -----------------------------------------------------------

export function addProposals(data: AppData, texts: string[], now: string): AppData {
  if (texts.length === 0) return data
  const fresh = texts.map((textFr, i) => ({ id: `${now}-${i}`, createdAt: now, textFr, status: 'pending' as const }))
  return { ...data, proposals: [...data.proposals, ...fresh] }
}

export function decideProposal(data: AppData, id: string, accept: boolean): AppData {
  return {
    ...data,
    proposals: data.proposals.map((p) => (p.id === id ? { ...p, status: accept ? 'accepted' : 'declined' } : p)),
  }
}

export function updateProfile(data: AppData, profile: Profile): AppData {
  return { ...data, profile }
}
