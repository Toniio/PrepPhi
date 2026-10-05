import { describe, expect, it } from 'vitest'
import { isAvailable } from '@/catalog'
import {
  getStep,
  initialElliptical,
  lowZone,
  planWeek,
  type ExerciseResult,
  type PlannedExercise,
  type PlannedSession,
  type Profile,
} from '@/engine'
import { checkIn, completeOnboarding, setTravelToday } from './actions'
import { emptyData, type AppData } from './schema'

const profile: Profile = {
  createdAt: '2026-10-05',
  availableDays: [1, 2, 3, 4, 5, 6, 7],
  calisthenicsPerWeek: 3,
  ellipticalPerWeek: 2,
  parkSessions: false,
  barLengthCm: 90,
  restingHr: 58,
  maxHr: null,
  age: 38,
  ellipticalResistance: { min: 1, max: 16 },
  freeWallAtHome: true,
  preferredTime: '18:30',
}

// Week 41 alternates B, A, B: Monday 5, Wednesday 7 and Friday 9 October 2026.
const WEEK = '2026-W41'
const MONDAY = '2026-10-05'
const WEDNESDAY = '2026-10-07'
const FRIDAY = '2026-10-09'

/** Core unlocks the handstand practice, which opens every session. */
const WITH_HANDSTAND = { 'core-isometric': { 1: 30, 2: 20, 3: 20 } }

function onboarded(tested: Record<string, Record<number, number>> = {}): AppData {
  const data = completeOnboarding(emptyData(), { profile, tested, today: MONDAY })
  const titles = ['Séance B', 'Séance A', 'Séance B']
  expect([MONDAY, WEDNESDAY, FRIDAY].map((d) => sessionOn(data, d).title)).toEqual(titles)
  return data
}

function sessionOn(data: AppData, date: string): PlannedSession {
  return data.weeks[WEEK].plan.sessions.find((s) => s.date === date && s.kind !== 'elliptical')!
}

function exerciseOf(session: PlannedSession, ladderId: string): PlannedExercise {
  return session.exercises.find((e) => e.ladderId === ladderId)!
}

/** The session done as planned: every set at its target. */
function asPlanned(session: PlannedSession, over: Partial<ExerciseResult> = {}): ExerciseResult[] {
  return session.exercises.map((e) => ({
    ladderId: e.ladderId,
    level: e.level,
    values: e.targets,
    feeling: 'right',
    pain: false,
    ...over,
  }))
}

function checkInMonday(data: AppData, results = asPlanned(sessionOn(data, MONDAY))): AppData {
  return checkIn(data, { weekId: WEEK, sessionId: sessionOn(data, MONDAY).id, date: MONDAY, results }).data
}

describe('checkIn: the sessions still planned follow the ladders', () => {
  it('raises the targets of the later sessions with the ladder', () => {
    const before = onboarded(WITH_HANDSTAND)
    expect(exerciseOf(sessionOn(before, WEDNESDAY), 'handstand-balance').targets).toEqual([2, 2, 2])
    expect(exerciseOf(sessionOn(before, FRIDAY), 'pull-horizontal').targets).toEqual([8, 8, 8])

    const after = checkInMonday(before)

    expect(after.ladderState['handstand-balance'].targets).toEqual([2, 2, 3])
    expect(exerciseOf(sessionOn(after, WEDNESDAY), 'handstand-balance').targets).toEqual([2, 2, 3])
    expect(after.ladderState['pull-horizontal'].targets).toEqual([8, 8, 9])
    expect(exerciseOf(sessionOn(after, FRIDAY), 'pull-horizontal').targets).toEqual([8, 8, 9])
  })

  it('follows a change of step: exercise, name and targets of the new one', () => {
    const before = onboarded({ 'pull-horizontal': { 1: 15, 2: 8 } })
    const planned = exerciseOf(sessionOn(before, FRIDAY), 'pull-horizontal')
    expect(planned.level).toBe(2)

    // Pain drops the ladder one step, to the bottom of the lower range.
    const results = asPlanned(sessionOn(before, MONDAY)).map((r) =>
      r.ladderId === 'pull-horizontal' ? { ...r, pain: true } : r,
    )
    const after = checkInMonday(before, results)

    const lower = getStep('pull-horizontal', 1)
    expect(after.ladderState['pull-horizontal']).toMatchObject({ level: 1, targets: [8, 8, 8], frozen: true })
    expect(exerciseOf(sessionOn(after, FRIDAY), 'pull-horizontal')).toMatchObject({
      level: 1,
      exercise: lower.exercise,
      nameFr: lower.nameFr,
      sets: 3,
      targets: [8, 8, 8],
      unit: lower.unit,
      perSide: false,
      cumulative: false,
    })
  })

  it('leaves the sessions done or abandoned as they are', () => {
    const base = onboarded(WITH_HANDSTAND)
    const abandoned = {
      ...base,
      weeks: {
        ...base.weeks,
        [WEEK]: {
          ...base.weeks[WEEK],
          plan: {
            ...base.weeks[WEEK].plan,
            sessions: base.weeks[WEEK].plan.sessions.map((s) =>
              s.date === WEDNESDAY && s.kind === 'calisthenics' ? { ...s, status: 'abandoned' as const } : s,
            ),
          },
        },
      },
    }
    const monday = sessionOn(abandoned, MONDAY)
    const wednesday = sessionOn(abandoned, WEDNESDAY)

    const after = checkInMonday(abandoned)

    expect(sessionOn(after, MONDAY)).toEqual({ ...monday, status: 'done' })
    expect(sessionOn(after, WEDNESDAY)).toEqual(wednesday)
    expect(exerciseOf(sessionOn(after, FRIDAY), 'pull-horizontal').targets).toEqual([8, 8, 9])
  })

  it('keeps two sets in a deload week', () => {
    const base = onboarded({ 'pull-horizontal': { 1: 15, 2: 8 } })
    const plan = planWeek({
      weekId: WEEK,
      profile,
      states: base.ladderState,
      trips: [],
      deload: true,
      elliptical: initialElliptical(profile),
      hrZone: lowZone(profile),
      available: isAvailable,
    })
    const before = { ...base, weeks: { ...base.weeks, [WEEK]: { ...base.weeks[WEEK], plan } } }
    expect(exerciseOf(sessionOn(before, FRIDAY), 'pull-horizontal')).toMatchObject({ level: 2, sets: 2 })

    const results = asPlanned(sessionOn(before, MONDAY)).map((r) =>
      r.ladderId === 'pull-horizontal' ? { ...r, pain: true } : r,
    )
    const after = checkInMonday(before, results)

    expect(exerciseOf(sessionOn(after, FRIDAY), 'pull-horizontal')).toMatchObject({
      level: 1,
      sets: 2,
      targets: [8, 8],
    })
  })

  it('keeps the fallback step of a travel day, and refreshes the rest of that session', () => {
    // Step 4 of the front legs needs the home: in a hotel room, step 3 at the top of its range.
    const home = onboarded({ 'legs-front': { 1: 99, 2: 99, 3: 99, 4: 99 } })
    const before = setTravelToday(home, { weekId: WEEK, date: WEDNESDAY, on: true })
    const nomad = sessionOn(before, WEDNESDAY)
    expect(nomad.kind).toBe('nomad')
    const legs = exerciseOf(nomad, 'legs-front')
    expect(before.ladderState['legs-front'].level).toBe(4)
    expect(legs.level).toBe(3)
    expect(exerciseOf(nomad, 'core-isometric').targets).toEqual([30, 30, 30])

    const after = checkInMonday(before)

    const refreshed = sessionOn(after, WEDNESDAY)
    expect(exerciseOf(refreshed, 'legs-front')).toEqual(legs)
    expect(exerciseOf(refreshed, 'core-isometric').targets).toEqual([30, 30, 35])
  })
})
