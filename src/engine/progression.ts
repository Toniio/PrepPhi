import { getLadder, getStep, maxLevel, setsOf } from './data'
import { RULES } from './rules'
import type { ExerciseResult, IsoDate, LadderState, LadderStep } from './types'

// Double progression (data/rules.json "progression"): within a step the
// targets climb from the bottom to the top of the range, then the next step
// is proposed and starts again at its bottom.

export type ProgressionEvent =
  | { type: 'calibrated'; ladderId: string; level: number }
  | { type: 'target-raised'; ladderId: string; level: number; set: number; value: number }
  | { type: 'held'; ladderId: string; level: number }
  | { type: 'step-up-proposed'; ladderId: string; from: number; to: number }
  | { type: 'ladder-top'; ladderId: string; level: number }
  | { type: 'skill-mastered'; ladderId: string }
  | { type: 'regressed'; ladderId: string; from: number; to: number }
  | { type: 'pain-drop'; ladderId: string; from: number; to: number }
  | { type: 'frozen'; ladderId: string }

export type ProgressionOutcome = { state: LadderState; events: ProgressionEvent[] }

export function bottomTargets(step: LadderStep): number[] {
  return Array(setsOf(step)).fill(step.range[0])
}

export function topTargets(step: LadderStep): number[] {
  return Array(setsOf(step)).fill(step.range[1])
}

/** A ladder placed at `level`, targets at the bottom of the range. */
export function placeAtLevel(ladderId: string, level = 1, unlocked?: boolean): LadderState {
  const ladder = getLadder(ladderId)
  const step = getStep(ladderId, level)
  return {
    ladderId,
    unlocked: unlocked ?? ladder.entry === null,
    level,
    targets: bottomTargets(step),
    topStreak: 0,
    regressStreak: 0,
    stepUpProposed: false,
    sessionsAtLevel: 0,
    lastValues: null,
    frozen: false,
    paused: false,
    lastTrained: null,
  }
}

function atLevel(state: LadderState, level: number, targets: number[]): LadderState {
  return {
    ...state,
    level,
    targets,
    topStreak: 0,
    regressStreak: 0,
    stepUpProposed: false,
    sessionsAtLevel: 0,
    lastValues: null,
  }
}

/** Values compared per set, or as one total on a cumulative step. */
function measured(step: LadderStep, values: number[]): number[] {
  return step.format === 'cumulative' ? [values.reduce((sum, v) => sum + v, 0)] : values
}

function increment(step: LadderStep): number {
  return step.unit === 's' ? RULES.progression.secondsStep : RULES.progression.repStep
}

/** The set to raise: the lowest target, the later set on a tie. */
function weakestSet(targets: number[]): number {
  let index = 0
  targets.forEach((t, i) => {
    if (t <= targets[index]) index = i
  })
  return index
}

export function isTopOfRange(step: LadderStep, values: number[]): boolean {
  const m = measured(step, values)
  return m.length >= setsOf(step) && m.every((v) => v >= step.range[1])
}

/** A cumulative final step: `pass.sets` holds of at least `pass.hold`. */
export function isMastered(step: LadderStep, values: number[]): boolean {
  if (!step.pass) return false
  return values.filter((v) => v >= step.pass!.hold).length >= step.pass.sets
}

type Options = {
  /** Semaine allégée: no progression. */
  deload?: boolean
  date?: IsoDate
}

/**
 * Applies one session's result to a ladder. Returns the new state and what
 * happened. Pure: the caller stores the state and shows the events.
 */
export function applyResult(state: LadderState, result: ExerciseResult, options: Options = {}): ProgressionOutcome {
  const { ladderId } = state
  const step = getStep(ladderId, state.level)
  const events: ProgressionEvent[] = []
  const base: LadderState = {
    ...state,
    sessionsAtLevel: state.sessionsAtLevel + 1,
    lastValues: [...result.values],
    lastTrained: options.date ?? state.lastTrained,
  }

  // Pain: freeze the family and drop one step for the next session.
  if (result.pain) {
    const to = Math.max(1, state.level - 1)
    const dropped = to === state.level ? base : atLevel(base, to, bottomTargets(getStep(ladderId, to)))
    events.push({ type: 'pain-drop', ladderId, from: state.level, to })
    return { state: { ...dropped, frozen: true }, events }
  }

  if (state.frozen || state.paused || options.deload) {
    events.push(state.frozen ? { type: 'frozen', ladderId } : { type: 'held', ladderId, level: state.level })
    return { state: base, events }
  }

  const values = measured(step, result.values)
  const top = isTopOfRange(step, result.values)
  const met = values.length >= state.targets.length && values.every((v, i) => v >= (state.targets[i] ?? 0))
  const bottomMissed = values.length < setsOf(step) || values.some((v) => v < step.range[0])
  const final = state.level === maxLevel(ladderId)

  // Calibration: too easy on the first session of a step -> top of range.
  if (state.sessionsAtLevel === 0 && result.feeling === 'too-easy' && !top) {
    events.push({ type: 'calibrated', ladderId, level: state.level })
    return { state: { ...base, targets: topTargets(step) }, events }
  }

  // Regress: bottom of range missed, or too hard, two sessions in a row.
  const regressing = bottomMissed || result.feeling === 'too-hard'
  const regressStreak = regressing ? state.regressStreak + 1 : 0
  if (regressStreak >= RULES.progression.regressSessions) {
    if (state.level > 1) {
      const to = state.level - 1
      events.push({ type: 'regressed', ladderId, from: state.level, to })
      return { state: atLevel(base, to, topTargets(getStep(ladderId, to))), events }
    }
    events.push({ type: 'held', ladderId, level: state.level })
    return { state: { ...base, targets: bottomTargets(step), regressStreak: 0, topStreak: 0 }, events }
  }

  // Next step: top of range on every set, not too hard, two sessions in a row.
  const qualifies = top && result.feeling !== 'too-hard'
  const topStreak = qualifies ? state.topStreak + 1 : 0
  let next: LadderState = { ...base, regressStreak, topStreak }

  if (step.format === 'cumulative' && final && isMastered(step, result.values)) {
    events.push({ type: 'skill-mastered', ladderId })
  }

  if (topStreak >= RULES.progression.nextStepSessions) {
    if (!final && !state.stepUpProposed) {
      events.push({ type: 'step-up-proposed', ladderId, from: state.level, to: state.level + 1 })
      next = { ...next, stepUpProposed: true }
    } else if (final) {
      events.push({ type: 'ladder-top', ladderId, level: state.level })
    }
    return { state: next, events }
  }

  // Within the step: targets met and not too hard -> +1 rep (+5 s) on the weakest set.
  if (met && result.feeling !== 'too-hard' && !top) {
    const set = weakestSet(next.targets)
    const value = Math.min(step.range[1], next.targets[set] + increment(step))
    if (value > next.targets[set]) {
      const targets = [...next.targets]
      targets[set] = value
      events.push({ type: 'target-raised', ladderId, level: state.level, set, value })
      return { state: { ...next, targets }, events }
    }
  }

  events.push({ type: 'held', ladderId, level: state.level })
  return { state: next, events }
}

/** Anthony accepted the proposed step at the review: bottom of the next range. */
export function acceptStepUp(state: LadderState): LadderState {
  if (!state.stepUpProposed || state.level >= maxLevel(state.ladderId)) return state
  const to = state.level + 1
  return atLevel(state, to, bottomTargets(getStep(state.ladderId, to)))
}

/** Anthony declined the step: stay, and ask again after two more qualifying sessions. */
export function declineStepUp(state: LadderState): LadderState {
  return { ...state, stepUpProposed: false, topStreak: 0 }
}

/** A re-entry week after a long break: back one step, top of its range. */
export function reenter(state: LadderState): LadderState {
  if (state.level <= 1) return atLevel(state, 1, bottomTargets(getStep(state.ladderId, 1)))
  const to = state.level - 1
  return atLevel(state, to, topTargets(getStep(state.ladderId, to)))
}
