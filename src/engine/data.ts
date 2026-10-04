import laddersJson from '../../data/ladders.json'
import type { Family, Ladder, LadderStep } from './types'

/** The 10 validated ladders, in the order of data/ladders.json. */
export const LADDERS = laddersJson.ladders as Ladder[]

export const LADDERS_VERSION: string = laddersJson.version

const BY_ID = new Map(LADDERS.map((ladder) => [ladder.id, ladder]))

export function getLadder(id: string): Ladder {
  const ladder = BY_ID.get(id)
  if (!ladder) throw new Error(`Unknown ladder "${id}"`)
  return ladder
}

export function getStep(ladderId: string, level: number): LadderStep {
  const step = getLadder(ladderId).steps.find((s) => s.level === level)
  if (!step) throw new Error(`Ladder "${ladderId}" has no level ${level}`)
  return step
}

export function maxLevel(ladderId: string): number {
  return getLadder(ladderId).steps.length
}

export function familyOf(ladderId: string): Family {
  return getLadder(ladderId).family
}

/** Number of sets of a step: one accumulated total for a cumulative step. */
export function setsOf(step: LadderStep): number {
  return step.format === 'cumulative' ? 1 : (step.sets ?? 3)
}
