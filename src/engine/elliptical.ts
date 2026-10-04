import { RULES } from './rules'
import type { CardioEntry, EllipticalState, Profile, Sequence } from './types'

// Elliptical endurance (data/rules.json "elliptical").

/** Low-zone bounds as fractions of the heart-rate reserve (Karvonen). */
export const LOW_ZONE_HRR: [number, number] = [0.6, 0.7]

/** Max HR known, or estimated from age (Tanaka: 208 - 0.7 × age). */
export function maxHeartRate(profile: Pick<Profile, 'maxHr' | 'age'>): number | null {
  if (profile.maxHr) return profile.maxHr
  if (profile.age) return Math.round(208 - 0.7 * profile.age)
  return null
}

/** The endurance target zone in bpm, from resting and max HR. */
export function lowZone(profile: Pick<Profile, 'restingHr' | 'maxHr' | 'age'>): [number, number] | null {
  const max = maxHeartRate(profile)
  if (!max || !profile.restingHr) return null
  const reserve = max - profile.restingHr
  return [
    Math.round(profile.restingHr + LOW_ZONE_HRR[0] * reserve),
    Math.round(profile.restingHr + LOW_ZONE_HRR[1] * reserve),
  ]
}

export function initialElliptical(profile: Pick<Profile, 'ellipticalResistance'>, durationMin = 30): EllipticalState {
  return { durationMin, resistance: profile.ellipticalResistance.min, stableWeeks: 0, intervalReps: null }
}

/** RPE <= 5 and average HR in the target zone (or unknown zone: RPE only). */
export function sessionOnTarget(entry: CardioEntry, zone: [number, number] | null): boolean {
  if (entry.rpe === null || entry.rpe > RULES.elliptical.rpeMax) return false
  if (!zone) return true
  return entry.avgHr !== null && entry.avgHr >= zone[0] && entry.avgHr <= zone[1]
}

export type EllipticalChange =
  | { type: 'duration'; from: number; to: number }
  | { type: 'resistance'; from: number; to: number }
  | { type: 'intervals-start'; reps: number }
  | { type: 'intervals-rep'; from: number; to: number }
  | { type: 'hold' }

/**
 * Weekly step, read at the review from the week's endurance sessions:
 * +5 min while under 45 min, then +1 resistance level at constant duration;
 * intervals start after 3 stable weeks at 40-45 min, +1 rep per week up to 10.
 * A semaine allégée holds everything.
 */
export function stepElliptical(input: {
  state: EllipticalState
  week: CardioEntry[]
  zone: [number, number] | null
  maxResistance: number
  deload: boolean
}): { state: EllipticalState; changes: EllipticalChange[] } {
  const { state, week, zone } = input
  const rules = RULES.elliptical
  if (input.deload || week.length === 0) return { state, changes: [{ type: 'hold' }] }

  const onTarget = week.every((entry) => sessionOnTarget(entry, zone))
  const inWindow = state.durationMin >= rules.intervalWindowMin[0] && state.durationMin <= rules.intervalWindowMin[1]
  const stableWeeks = onTarget && inWindow ? state.stableWeeks + 1 : onTarget ? state.stableWeeks : 0
  const changes: EllipticalChange[] = []
  let next: EllipticalState = { ...state, stableWeeks }

  if (onTarget) {
    if (state.durationMin < rules.maxDurationMin) {
      const to = Math.min(rules.maxDurationMin, state.durationMin + rules.durationStepMin)
      changes.push({ type: 'duration', from: state.durationMin, to })
      next = { ...next, durationMin: to }
    } else if (state.resistance < input.maxResistance) {
      const to = state.resistance + rules.resistanceStep
      changes.push({ type: 'resistance', from: state.resistance, to })
      next = { ...next, resistance: to }
    }
  }

  if (state.intervalReps === null) {
    if (stableWeeks >= rules.intervalStableWeeks) {
      changes.push({ type: 'intervals-start', reps: rules.intervalStartReps })
      next = { ...next, intervalReps: rules.intervalStartReps }
    }
  } else if (state.intervalReps < rules.intervalMaxReps) {
    changes.push({ type: 'intervals-rep', from: state.intervalReps, to: state.intervalReps + 1 })
    next = { ...next, intervalReps: state.intervalReps + 1 }
  }

  return { state: next, changes: changes.length ? changes : [{ type: 'hold' }] }
}

/** The interval block for the sequencer: reps × (1 min hard / 2 min easy). */
export function intervalSequence(reps: number): Sequence {
  return {
    label: 'Fractionné',
    rounds: reps,
    blocks: [
      { label: 'Rapide', seconds: RULES.elliptical.hardSec, kind: 'work' },
      { label: 'Récupération', seconds: RULES.elliptical.easySec, kind: 'rest' },
    ],
  }
}
