import { getLadder, getStep, LADDERS } from './data'
import { isTopOfRange, placeAtLevel } from './progression'
import type { EntryCondition, LadderState } from './types'

export type States = Record<string, LadderState>

/** A condition holds once its level is passed, or at that level when the latest session meets it. */
export function conditionHolds(condition: EntryCondition, states: States): boolean {
  const state = states[condition.ladder]
  if (!state || !state.unlocked) return false
  if (state.level > condition.level) return true
  if (state.level < condition.level || !state.lastValues) return false
  const step = getStep(condition.ladder, condition.level)
  if (condition.atTopOfRange && !isTopOfRange(step, state.lastValues)) return false
  if (condition.minValue !== undefined && !state.lastValues.every((v) => v >= condition.minValue!)) return false
  return true
}

/** Every condition must hold (e.g. muscle-up: pulling strength AND hollow body). */
export function entryMet(ladderId: string, states: States): boolean {
  const { entry } = getLadder(ladderId)
  return entry === null || entry.every((condition) => conditionHolds(condition, states))
}

/** Unlocks the skill ladders whose conditions now hold. Returns the ids unlocked. */
export function unlockLadders(states: States): { states: States; unlocked: string[] } {
  const next = { ...states }
  const unlocked: string[] = []
  for (const ladder of LADDERS) {
    const state = next[ladder.id] ?? placeAtLevel(ladder.id)
    if (!state.unlocked && entryMet(ladder.id, next)) {
      next[ladder.id] = { ...state, unlocked: true }
      unlocked.push(ladder.id)
    } else {
      next[ladder.id] = state
    }
  }
  return { states: next, unlocked }
}

/**
 * Onboarding placement: each ladder starts at the highest step whose bottom
 * of range Anthony holds cleanly in the test session. `tested` maps a
 * ladder to the best value reached per level tried.
 */
export function placeLadders(tested: Record<string, Record<number, number>>): States {
  const states: States = {}
  for (const ladder of LADDERS) {
    const results = tested[ladder.id] ?? {}
    let level = 1
    for (const step of ladder.steps) {
      const value = results[step.level]
      if (value !== undefined && value >= step.range[0]) level = step.level
    }
    const placed = placeAtLevel(ladder.id, level)
    const value = results[level]
    // The test value counts as the latest session, so a skill can unlock right away.
    states[ladder.id] =
      value === undefined ? placed : { ...placed, lastValues: Array(placed.targets.length).fill(value) }
  }
  return unlockLadders(states).states
}
