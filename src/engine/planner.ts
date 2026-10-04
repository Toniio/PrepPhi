import { getLadder, getStep, setsOf } from './data'
import { weekDates, weekday } from './dates'
import { intervalSequence } from './elliptical'
import { topTargets } from './progression'
import { RULES } from './rules'
import { isTravelDay, type Trip } from './travel'
import type {
  Context,
  EllipticalState,
  IsoDate,
  LadderState,
  PlannedExercise,
  PlannedSession,
  Profile,
  Sequence,
  WeekId,
  WeekPlan,
} from './types'

// The rule-based weekly plan. The coach receives it at the review and may
// rearrange it; in development the scripted coach returns it as is.
//
// Template (not fixed by rules.json, chosen when the engine was written):
// full-body sessions A and B alternate, never on consecutive days, the
// handstand practice opens every session once unlocked, the muscle-up runs
// only in the optional park session.

export const SESSION_A = ['pull-vertical', 'push', 'legs-front', 'core-hanging']
export const SESSION_B = ['pull-horizontal', 'legs-posterior', 'core-isometric', 'handstand-strength']
export const EVERY_SESSION = ['handstand-balance']
export const NOMAD = ['push', 'legs-front', 'core-isometric']
export const PARK = ['muscle-up']

export const REST_SEC = { reps: 90, s: 60, skill: 120 }

/** Can `exercise` be done in `context`? From the catalog and the hors-dataset sheets. */
export type ExerciseAvailability = (exerciseId: string, context: Context) => boolean

export type PlanInput = {
  weekId: WeekId
  profile: Profile
  states: Record<string, LadderState>
  trips: Trip[]
  deload: boolean
  elliptical: EllipticalState
  hrZone: [number, number] | null
  available: ExerciseAvailability
  /** Hotel room with a free wall: handstand practice in travel. */
  wallWhileTravelling?: boolean
}

function plannedExercise(state: LadderState, context: Context, input: PlanInput): PlannedExercise | null {
  const ladder = getLadder(state.ladderId)
  if (!state.unlocked || state.paused || !ladder.contexts.includes(context)) return null

  // The current step, or the highest lower step doable here at the top of its range.
  let step = getStep(state.ladderId, state.level)
  let targets = state.targets
  if (!input.available(step.exercise, context)) {
    const fallback = ladder.steps
      .filter((s) => s.level < state.level && input.available(s.exercise, context))
      .at(-1)
    if (!fallback) return null
    step = fallback
    targets = topTargets(fallback)
  }

  const cumulative = step.format === 'cumulative'
  const sets = cumulative ? 1 : input.deload ? Math.min(RULES.deload.deloadSets, setsOf(step)) : setsOf(step)
  return {
    ladderId: state.ladderId,
    level: step.level,
    exercise: step.exercise,
    nameFr: step.nameFr,
    sets,
    targets: targets.slice(0, sets),
    unit: step.unit,
    perSide: step.perSide ?? false,
    cumulative,
    restSec: ladder.family === 'skill' ? REST_SEC.skill : REST_SEC[step.unit],
  }
}

function exercisesFor(ladderIds: string[], context: Context, input: PlanInput): PlannedExercise[] {
  return ladderIds
    .map((id) => input.states[id])
    .filter((state): state is LadderState => state !== undefined)
    .map((state) => plannedExercise(state, context, input))
    .filter((exercise): exercise is PlannedExercise => exercise !== null)
}

const WORK_SEC = 40
const WARMUP_MIN = 5

function estimateMinutes(exercises: PlannedExercise[]): number {
  const seconds = exercises.reduce((sum, e) => sum + e.sets * (WORK_SEC * (e.perSide ? 2 : 1) + e.restSec), 0)
  return Math.max(15, Math.round((WARMUP_MIN + seconds / 60) / 5) * 5)
}

/** Room circuit for travel days: burpee, mountain climber, jump squat. */
export function roomCircuit(): Sequence {
  return {
    label: 'Circuit en chambre',
    rounds: 4,
    blocks: [
      { label: 'Burpee', seconds: 30, kind: 'work' },
      { label: 'Repos', seconds: 15, kind: 'rest' },
      { label: 'Mountain climber', seconds: 30, kind: 'work' },
      { label: 'Repos', seconds: 15, kind: 'rest' },
      { label: 'Squat sauté', seconds: 30, kind: 'work' },
      { label: 'Repos', seconds: 60, kind: 'rest' },
    ],
  }
}

function session(base: Omit<PlannedSession, 'id' | 'status' | 'sequences'> & { sequences?: Sequence[] }): PlannedSession {
  return { ...base, id: `${base.date}-${base.kind}`, status: 'planned', sequences: base.sequences ?? [] }
}

/** All ways to pick `count` days with no two consecutive, best spread first. */
export function spreadDays(days: IsoDate[], count: number): IsoDate[] {
  if (count <= 0) return []
  const sorted = [...days].sort()
  const index = (d: IsoDate) => weekday(d)
  let best: IsoDate[] = []
  let bestScore = -1
  const pick = (start: number, chosen: IsoDate[]) => {
    if (chosen.length === count) {
      const gaps = chosen.slice(1).map((d, i) => index(d) - index(chosen[i]))
      const score = gaps.length ? Math.min(...gaps) * 10 + gaps.reduce((a, b) => a + b, 0) : 1
      if (score > bestScore) [best, bestScore] = [[...chosen], score]
      return
    }
    for (let i = start; i < sorted.length; i += 1) {
      const last = chosen.at(-1)
      if (last && index(sorted[i]) - index(last) < 2) continue
      pick(i + 1, [...chosen, sorted[i]])
    }
  }
  pick(0, [])
  // Not enough non-consecutive days: take fewer sessions rather than break the rule.
  return best.length ? best : count > 1 ? spreadDays(days, count - 1) : []
}

/** The rule-based plan of a week. */
export function planWeek(input: PlanInput): WeekPlan {
  const { profile, weekId } = input
  const dates = weekDates(weekId)
  const open = dates.filter((d) => profile.availableDays.includes(weekday(d)))
  const travel = (d: IsoDate) => isTravelDay(d, input.trips)
  const weekNumber = Number(weekId.split('-W')[1])
  const sessions: PlannedSession[] = []

  // Calisthenics: A/B alternation on home days, nomad sessions on travel days.
  const calisthenicsDays = spreadDays(open, profile.calisthenicsPerWeek)
  let turn = weekNumber % 2
  for (const date of calisthenicsDays) {
    if (travel(date)) {
      const ladders = input.wallWhileTravelling ? [...EVERY_SESSION, ...NOMAD] : NOMAD
      sessions.push(
        session({
          date,
          kind: 'nomad',
          context: 'travel',
          title: 'Séance nomade',
          durationMin: RULES.travel.nomadMinutes[1],
          exercises: exercisesFor(ladders, 'travel', input),
          sequences: [roomCircuit()],
        }),
      )
      continue
    }
    const template = turn % 2 === 0 ? SESSION_A : SESSION_B
    turn += 1
    const exercises = exercisesFor([...EVERY_SESSION, ...template], 'home', input)
    sessions.push(
      session({
        date,
        kind: 'calisthenics',
        context: 'home',
        title: template === SESSION_A ? 'Séance A' : 'Séance B',
        durationMin: estimateMinutes(exercises),
        exercises,
      }),
    )
  }

  // Optional park session: muscle-up, on a free weekend day.
  if (profile.parkSessions && input.states['muscle-up']?.unlocked) {
    const weekend = open.filter((d) => weekday(d) >= 6 && !travel(d) && !calisthenicsDays.includes(d))
    if (weekend.length) {
      const exercises = exercisesFor(PARK, 'park', input)
      if (exercises.length) {
        sessions.push(
          session({
            date: weekend[0],
            kind: 'park',
            context: 'park',
            title: 'Séance au parc',
            durationMin: estimateMinutes(exercises),
            exercises,
          }),
        )
      }
    }
  }

  // Elliptical at home, on days without calisthenics first.
  const taken = new Set(sessions.map((s) => s.date))
  const homeDays = open.filter((d) => !travel(d))
  const ellipticalDays = [...homeDays.filter((d) => !taken.has(d)), ...homeDays.filter((d) => taken.has(d))]
    .slice(0, profile.ellipticalPerWeek)
    .sort()
  ellipticalDays.forEach((date, i) => {
    const intervals = !input.deload && input.elliptical.intervalReps !== null && i % 2 === 1
    sessions.push(
      session({
        date,
        kind: 'elliptical',
        context: 'home',
        title: intervals ? 'Elliptique, fractionné' : 'Elliptique, endurance',
        durationMin: input.elliptical.durationMin,
        exercises: [],
        sequences: intervals ? [intervalSequence(input.elliptical.intervalReps!)] : [],
        cardio: {
          durationMin: input.elliptical.durationMin,
          resistance: input.elliptical.resistance,
          hrZone: input.hrZone,
        },
      }),
    )
  })

  sessions.sort((a, b) => a.date.localeCompare(b.date) || a.kind.localeCompare(b.kind))
  return {
    weekId,
    deload: input.deload,
    trips: input.trips.map((t) => ({ ...t, confirmed: true })),
    sessions,
  }
}
