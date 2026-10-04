import { describe, expect, it } from 'vitest'
import { addDays, previousWeek, weekDates, weekday, weekId, weekStart } from './dates'
import { initialElliptical, intervalSequence, lowZone, maxHeartRate, stepElliptical } from './elliptical'
import { placeLadders } from './entry'
import { planWeek, spreadDays, type PlanInput } from './planner'
import { placeAtLevel, type ProgressionEvent } from './progression'
import { reviewFacts } from './review'
import { regularity, rescheduleMissed } from './schedule'
import { deloadTriggers, hrDrift, recurringPain, rpeStreak, tooHardExercises } from './signals'
import { detectTrips, isTravelDay, staleLadders } from './travel'
import type { CardioEntry, ExerciseResult, PlannedSession, Profile, SessionLog } from './types'

const profile: Profile = {
  createdAt: '2026-10-04',
  availableDays: [1, 2, 3, 4, 5, 6, 7],
  calisthenicsPerWeek: 3,
  ellipticalPerWeek: 2,
  parkSessions: true,
  barLengthCm: 90,
  restingHr: 60,
  maxHr: 185,
  age: 38,
  ellipticalResistance: { min: 1, max: 16 },
  freeWallAtHome: true,
  preferredTime: '18:30',
}

const result = (ladderId: string, over: Partial<ExerciseResult> = {}): ExerciseResult => ({
  ladderId,
  level: 1,
  values: [10, 10, 10],
  feeling: 'right',
  pain: false,
  ...over,
})

const log = (date: string, results: ExerciseResult[]): SessionLog => ({
  sessionId: `${date}-calisthenics`,
  date,
  kind: 'calisthenics',
  results,
})

const cardio = (date: string, over: Partial<CardioEntry> = {}): CardioEntry => ({
  id: `${date} 18:00:00`,
  date,
  type: 'Elliptical',
  durationMin: 30,
  avgHr: 130,
  maxHr: 150,
  calories: 300,
  resistance: 6,
  rpe: 4,
  ...over,
})

const W41 = '2026-W41' // Monday 5 October to Sunday 11 October 2026

describe('dates', () => {
  it('numbers ISO weeks', () => {
    expect(weekId('2026-10-04')).toBe('2026-W40') // Sunday
    expect(weekId('2026-10-05')).toBe(W41) // Monday
    expect(weekId('2026-12-31')).toBe('2026-W53')
    expect(weekId('2027-01-01')).toBe('2026-W53')
    expect(weekStart(W41)).toBe('2026-10-05')
    expect(weekDates(W41).at(-1)).toBe('2026-10-11')
    expect(previousWeek(W41, 4)).toBe('2026-W37')
    expect(weekday('2026-10-11')).toBe(7)
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01')
  })
})

describe('semaine allégée triggers', () => {
  it('fires on too-hard on 3 exercises in the week', () => {
    const logs = [
      log('2026-10-05', [result('push', { feeling: 'too-hard' }), result('legs-front', { feeling: 'too-hard' })]),
      log('2026-10-07', [result('pull-vertical', { feeling: 'too-hard' }), result('push', { feeling: 'too-hard' })]),
    ]
    expect(tooHardExercises(logs, W41)).toHaveLength(3)
    expect(deloadTriggers({ week: W41, logs, events: [], cardio: [] })).toEqual(['too-hard-count'])
    expect(deloadTriggers({ week: W41, logs: logs.slice(0, 1), events: [], cardio: [] })).toEqual([])
  })

  it('fires on regressions in 2 families', () => {
    const events: ProgressionEvent[] = [
      { type: 'regressed', ladderId: 'pull-vertical', from: 4, to: 3 },
      { type: 'regressed', ladderId: 'pull-horizontal', from: 2, to: 1 },
    ]
    expect(deloadTriggers({ week: W41, logs: [], events, cardio: [] })).toEqual([])
    events.push({ type: 'regressed', ladderId: 'push', from: 3, to: 2 })
    expect(deloadTriggers({ week: W41, logs: [], events, cardio: [] })).toEqual(['double-regress'])
  })

  it('fires on RPE >= 7 on two endurance sessions in a row', () => {
    const entries = [cardio('2026-10-01', { rpe: 7 }), cardio('2026-10-06', { rpe: 8 })]
    expect(rpeStreak(entries, W41)).toBe(true)
    expect(rpeStreak([cardio('2026-10-01', { rpe: 6 }), cardio('2026-10-06', { rpe: 8 })], W41)).toBe(false)
  })

  it('fires on a heart rate 8 bpm above the 4-week average at equal duration and resistance', () => {
    const before = ['2026-09-08', '2026-09-15', '2026-09-22', '2026-09-29'].map((d) => cardio(d, { avgHr: 130 }))
    expect(hrDrift([...before, cardio('2026-10-06', { avgHr: 138 })], W41)).toBe(true)
    expect(hrDrift([...before, cardio('2026-10-06', { avgHr: 137 })], W41)).toBe(false)
    expect(hrDrift([...before, cardio('2026-10-06', { avgHr: 140, resistance: 7 })], W41)).toBe(false)
  })
})

describe('recurring pain', () => {
  it('flags a family with pain 2 weeks in a row', () => {
    const logs = [
      log('2026-09-30', [result('pull-vertical', { pain: true })]),
      log('2026-10-06', [result('pull-horizontal', { pain: true }), result('push', { pain: true })]),
    ]
    expect(recurringPain(logs, W41)).toEqual(['pull'])
  })
})

describe('elliptical', () => {
  it('computes the low zone from resting and max HR', () => {
    expect(lowZone(profile)).toEqual([135, 148])
    expect(maxHeartRate({ maxHr: null, age: 40 })).toBe(180)
    expect(lowZone({ ...profile, restingHr: null })).toBeNull()
  })

  const zone: [number, number] = [120, 140]
  const step = (state = initialElliptical(profile), week = [cardio('2026-10-06')], deload = false) =>
    stepElliptical({ state, week, zone, maxResistance: 16, deload })

  it('adds 5 min a week while on target, up to 45 min', () => {
    expect(step().changes).toEqual([{ type: 'duration', from: 30, to: 35 }])
    expect(step({ ...initialElliptical(profile), durationMin: 45 }).changes[0]).toEqual({
      type: 'resistance',
      from: 1,
      to: 2,
    })
  })

  it('holds when RPE is above 5 or the HR is out of the zone', () => {
    expect(step(undefined, [cardio('2026-10-06', { rpe: 6 })]).changes).toEqual([{ type: 'hold' }])
    expect(step(undefined, [cardio('2026-10-06', { avgHr: 145 })]).changes).toEqual([{ type: 'hold' }])
    expect(step(undefined, undefined, true).changes).toEqual([{ type: 'hold' }])
  })

  it('starts intervals after 3 stable weeks at 40-45 min, then adds a rep a week up to 10', () => {
    let state = { ...initialElliptical(profile), durationMin: 40 }
    for (let i = 0; i < 3; i += 1) state = step(state).state
    expect(state.intervalReps).toBe(6)
    for (let i = 0; i < 6; i += 1) state = step(state).state
    expect(state.intervalReps).toBe(10)
    expect(intervalSequence(6)).toMatchObject({ rounds: 6, blocks: [{ seconds: 60 }, { seconds: 120 }] })
  })
})

describe('travel', () => {
  it('detects consecutive all-day Paris events as one trip', () => {
    const trips = detectTrips([
      { title: 'Paris', start: '2026-10-06', end: '2026-10-07', allDay: true },
      { title: 'Paris - client', start: '2026-10-07', end: '2026-10-09', allDay: true },
      { title: 'Réunion Paris', start: '2026-10-06T10:00:00', end: '2026-10-06T11:00:00', allDay: false },
      { title: 'Lyon', start: '2026-10-10', end: '2026-10-11', allDay: true },
    ])
    expect(trips).toEqual([{ from: '2026-10-06', to: '2026-10-08' }])
    expect(isTravelDay('2026-10-08', trips)).toBe(true)
    expect(isTravelDay('2026-10-09', trips)).toBe(false)
  })

  it('lists ladders untrained for more than 10 days', () => {
    const states = [
      { ...placeAtLevel('push', 2), lastTrained: '2026-09-28' },
      { ...placeAtLevel('pull-vertical', 2), lastTrained: '2026-09-30' },
    ]
    expect(staleLadders(states, '2026-10-09')).toEqual([{ ladderId: 'push', days: 11 }])
  })
})

describe('planner', () => {
  const states = placeLadders({})
  const input = (over: Partial<PlanInput> = {}): PlanInput => ({
    weekId: W41,
    profile,
    states,
    trips: [],
    deload: false,
    elliptical: initialElliptical(profile),
    hrZone: [120, 140],
    available: () => true,
    ...over,
  })

  it('never puts calisthenics on consecutive days', () => {
    const days = spreadDays(weekDates(W41), 3)
    expect(days).toEqual(['2026-10-05', '2026-10-07', '2026-10-09'])
    // Sunday and the next Monday are consecutive: never both.
    expect(spreadDays(['2026-10-05', '2026-10-08', '2026-10-11'], 3)).toEqual(['2026-10-05', '2026-10-08'])
    expect(spreadDays(['2026-10-05', '2026-10-06', '2026-10-07'], 3)).toEqual(['2026-10-05', '2026-10-07'])
  })

  it('alternates sessions A and B, and adds the elliptical on other days', () => {
    const plan = planWeek(input())
    const strength = plan.sessions.filter((s) => s.kind === 'calisthenics')
    expect(strength.map((s) => s.title)).toEqual(['Séance B', 'Séance A', 'Séance B'])
    const elliptical = plan.sessions.filter((s) => s.kind === 'elliptical')
    expect(elliptical).toHaveLength(2)
    expect(elliptical.every((s) => !strength.some((c) => c.date === s.date))).toBe(true)
    expect(plan.sessions.some((s) => s.kind === 'park')).toBe(false) // muscle-up still locked
  })

  it('keeps locked skills out and the A/B ladders in', () => {
    const a = planWeek(input()).sessions.find((s) => s.title === 'Séance A')!
    expect(a.exercises.map((e) => e.ladderId)).toEqual(['pull-vertical', 'push', 'legs-front', 'core-hanging'])
    expect(a.exercises[0]).toMatchObject({ sets: 3, targets: [20, 20, 20], unit: 's', restSec: 60 })
  })

  it('turns travel days into nomad sessions without pulling', () => {
    const plan = planWeek(input({ trips: [{ from: '2026-10-07', to: '2026-10-09' }] }))
    const nomad = plan.sessions.find((s) => s.kind === 'nomad')!
    expect(nomad.date).toBe('2026-10-07')
    expect(nomad.exercises.map((e) => e.ladderId)).toEqual(['push', 'legs-front', 'core-isometric'])
    expect(nomad.sequences[0].label).toBe('Circuit en chambre')
    expect(
      plan.sessions.filter((s) => s.kind === 'elliptical').every((s) => s.date < '2026-10-07' || s.date > '2026-10-09'),
    ).toBe(true)
  })

  it('falls back to a doable lower step in travel, at the top of its range', () => {
    const at4 = { ...states, 'legs-front': placeAtLevel('legs-front', 4) }
    const plan = planWeek(
      input({
        states: at4,
        trips: [{ from: '2026-10-05', to: '2026-10-11' }],
        available: (exercise, context) => !(exercise === 'ds:1476' && context === 'travel'),
      }),
    )
    const legs = plan.sessions[0].exercises.find((e) => e.ladderId === 'legs-front')!
    expect(legs).toMatchObject({ level: 3, exercise: 'ds:2368', targets: [12, 12, 12] })
  })

  it('plans 2 sets in a semaine allégée and no intervals', () => {
    const plan = planWeek(input({ deload: true, elliptical: { ...initialElliptical(profile), intervalReps: 7 } }))
    const a = plan.sessions.find((s) => s.title === 'Séance A')!
    expect(a.exercises.every((e) => e.sets === 2 && e.targets.length === 2)).toBe(true)
    expect(plan.sessions.filter((s) => s.kind === 'elliptical').every((s) => s.sequences.length === 0)).toBe(true)
  })

  it('adds the optional park session on a free weekend day once the muscle-up is open', () => {
    const open = { ...states, 'muscle-up': placeAtLevel('muscle-up', 1, true) }
    const park = planWeek(input({ states: open })).sessions.find((s) => s.kind === 'park')!
    expect(park.date).toBe('2026-10-10')
    expect(park.exercises[0].ladderId).toBe('muscle-up')
  })

  it('opens every session with the handstand practice once unlocked', () => {
    const open = { ...states, 'handstand-balance': placeAtLevel('handstand-balance', 1, true) }
    for (const session of planWeek(input({ states: open })).sessions.filter((s) => s.kind === 'calisthenics')) {
      expect(session.exercises[0].ladderId).toBe('handstand-balance')
      expect(session.exercises[0].restSec).toBe(120)
    }
  })
})

describe('missed sessions and regularity', () => {
  const plan = planWeek({
    weekId: W41,
    profile,
    states: placeLadders({}),
    trips: [],
    deload: false,
    elliptical: initialElliptical(profile),
    hrZone: null,
    available: () => true,
  })
  const nomad = (s: PlannedSession, date: string): PlannedSession => ({
    ...s,
    id: `${date}-nomad`,
    date,
    kind: 'nomad',
    context: 'travel',
  })

  it('slides a missed session to the next free day, never next to another calisthenics day', () => {
    // Calisthenics on Mon 5, Wed 7, Fri 9. Missing Monday, on Monday: Tuesday to Saturday touch another session.
    const { plan: next, outcome } = rescheduleMissed(plan, '2026-10-05-calisthenics', '2026-10-05', [], nomad)
    expect(outcome).toEqual({ type: 'moved', to: '2026-10-11', nomad: false })
    expect(next.sessions.find((s) => s.id === '2026-10-05-calisthenics')?.status).toBe('missed')
    expect(next.sessions.find((s) => s.id === '2026-10-11-calisthenics')?.movedFrom).toBe('2026-10-05')
  })

  it('abandons it when no slot is left before Sunday', () => {
    const { outcome } = rescheduleMissed(plan, '2026-10-09-calisthenics', '2026-10-12', [], nomad)
    expect(outcome).toEqual({ type: 'abandoned' })
  })

  it('moves it to a travel day only as the nomad version', () => {
    const { outcome } = rescheduleMissed(
      plan,
      '2026-10-05-calisthenics',
      '2026-10-05',
      [{ from: '2026-10-11', to: '2026-10-11' }],
      nomad,
    )
    expect(outcome).toEqual({ type: 'moved', to: '2026-10-11', nomad: true })
  })

  it('counts done / planned, a moved session once and the park session only when done', () => {
    const done = {
      ...plan,
      sessions: plan.sessions.map((s, i) => (i < 2 ? { ...s, status: 'done' as const } : s)),
    }
    expect(regularity(done)).toEqual({ done: 2, planned: 5, ratio: 0.4 })
  })
})

describe('review facts', () => {
  it('gathers what the coach needs', () => {
    const states = placeLadders({})
    states['pull-vertical'] = { ...states['pull-vertical'], stepUpProposed: true }
    const plan = planWeek({
      weekId: W41,
      profile,
      states,
      trips: [],
      deload: false,
      elliptical: initialElliptical(profile),
      hrZone: null,
      available: () => true,
    })
    const facts = reviewFacts({
      plan,
      logs: [log('2026-10-05', [result('pull-vertical', { pain: true })])],
      events: [{ type: 'pain-drop', ladderId: 'pull-vertical', from: 2, to: 1 }],
      states,
      cardio: [],
    })
    expect(facts.stepUps).toEqual([{ ladderId: 'pull-vertical', from: 1, to: 2 }])
    expect(facts.painFamilies).toEqual(['pull'])
    expect(facts.painDrops).toHaveLength(1)
    expect(facts.ladders.find((l) => l.ladderId === 'pull-vertical')?.results).toHaveLength(1)
    expect(facts.ladders.some((l) => l.ladderId === 'muscle-up')).toBe(false)
  })
})
