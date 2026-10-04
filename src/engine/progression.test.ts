import { describe, expect, it } from 'vitest'
import { conditionHolds, entryMet, placeLadders, unlockLadders } from './entry'
import { acceptStepUp, applyResult, declineStepUp, placeAtLevel, reenter } from './progression'
import type { ExerciseResult, Feeling, LadderState } from './types'

const result = (state: LadderState, values: number[], feeling: Feeling = 'right', pain = false): ExerciseResult => ({
  ladderId: state.ladderId,
  level: state.level,
  values,
  feeling,
  pain,
})

/** Applies several sessions in a row and returns the final state and every event. */
function run(state: LadderState, sessions: [number[], Feeling?, boolean?][]) {
  const events = []
  let current = state
  for (const [values, feeling, pain] of sessions) {
    const outcome = applyResult(current, result(current, values, feeling ?? 'right', pain ?? false), {
      date: '2026-10-05',
    })
    current = outcome.state
    events.push(...outcome.events)
  }
  return { state: current, events }
}

// pull-vertical L4: ds:0652 pull-up, 3 × [3, 8] reps. push L1: wall push-up, 3 × [10, 20].
const pullUp = () => placeAtLevel('pull-vertical', 4)

describe('placement', () => {
  it('starts at the bottom of the range', () => {
    expect(pullUp()).toMatchObject({ level: 4, targets: [3, 3, 3], unlocked: true, sessionsAtLevel: 0 })
  })

  it('places each ladder at the highest step whose bottom is held', () => {
    const states = placeLadders({ 'pull-vertical': { 3: 4, 4: 3, 5: 2 }, push: { 4: 7 } })
    expect(states['pull-vertical'].level).toBe(4) // L5 bottom is 5, only 2 held
    expect(states.push.level).toBe(1) // L4 bottom is 8, only 7 held
    expect(states['legs-front'].level).toBe(1)
    expect(states['handstand-balance'].unlocked).toBe(false)
  })
})

describe('double progression within a step', () => {
  it('adds one rep to the weakest set when targets are met', () => {
    const { state, events } = run(pullUp(), [[[3, 3, 3]]])
    expect(state.targets).toEqual([3, 3, 4])
    expect(events).toContainEqual(expect.objectContaining({ type: 'target-raised', set: 2, value: 4 }))
  })

  it('raises the lowest set first, the later set on a tie', () => {
    expect(run(pullUp(), [[[4, 4, 4]], [[4, 4, 4]]]).state.targets).toEqual([3, 4, 4])
    expect(run(pullUp(), [[[4, 4, 4]], [[4, 4, 4]], [[5, 5, 5]]]).state.targets).toEqual([4, 4, 4])
  })

  it('adds 5 s on a hold', () => {
    const plank = placeAtLevel('core-isometric', 1) // 3 × [30, 60] s
    expect(run(plank, [[[30, 30, 30]]]).state.targets).toEqual([30, 30, 35])
  })

  it('holds the targets when they are missed but the bottom is held', () => {
    const start = { ...pullUp(), targets: [5, 5, 5] }
    const { state, events } = run(start, [[[5, 4, 3]]])
    expect(state.targets).toEqual([5, 5, 5])
    expect(events.at(-1)?.type).toBe('held')
  })

  it('does not raise after a too-hard session', () => {
    expect(run(pullUp(), [[[3, 3, 3], 'too-hard']]).state.targets).toEqual([3, 3, 3])
  })

  it('never raises a target above the top of the range', () => {
    const start = { ...pullUp(), targets: [8, 8, 7], sessionsAtLevel: 3 }
    expect(run(start, [[[8, 8, 7]]]).state.targets).toEqual([8, 8, 8])
  })
})

describe('next step', () => {
  it('is proposed after 2 sessions at the top of the range, never applied alone', () => {
    const start = { ...pullUp(), targets: [8, 8, 8], sessionsAtLevel: 4 }
    const once = run(start, [[[8, 8, 8]]])
    expect(once.events.map((e) => e.type)).not.toContain('step-up-proposed')
    const twice = run(start, [[[8, 8, 8]], [[8, 9, 8], 'too-easy']])
    expect(twice.state).toMatchObject({ level: 4, stepUpProposed: true })
    expect(twice.events).toContainEqual({ type: 'step-up-proposed', ladderId: 'pull-vertical', from: 4, to: 5 })
  })

  it('needs both sessions in a row', () => {
    const start = { ...pullUp(), targets: [8, 8, 8], sessionsAtLevel: 4 }
    const broken = run(start, [[[8, 8, 8]], [[8, 7, 8]], [[8, 8, 8]]])
    expect(broken.state.stepUpProposed).toBe(false)
  })

  it('does not count a too-hard session at the top', () => {
    const start = { ...pullUp(), targets: [8, 8, 8], sessionsAtLevel: 4 }
    expect(run(start, [[[8, 8, 8]], [[8, 8, 8], 'too-hard']]).state.stepUpProposed).toBe(false)
  })

  it('starts the accepted step at the bottom of its range', () => {
    const start = { ...pullUp(), targets: [8, 8, 8], sessionsAtLevel: 4 }
    const proposed = run(start, [[[8, 8, 8]], [[8, 8, 8]]]).state
    expect(acceptStepUp(proposed)).toMatchObject({ level: 5, targets: [5, 5, 5], topStreak: 0, stepUpProposed: false })
    expect(declineStepUp(proposed)).toMatchObject({ level: 4, stepUpProposed: false, topStreak: 0 })
  })

  it('marks the top of a final step without proposing more', () => {
    const strict = { ...placeAtLevel('muscle-up', 6, true), targets: [5, 5, 5], sessionsAtLevel: 3 }
    const { state, events } = run(strict, [[[5, 5, 5]], [[5, 5, 5]]])
    expect(state.stepUpProposed).toBe(false)
    expect(events).toContainEqual({ type: 'ladder-top', ladderId: 'muscle-up', level: 6 })
  })
})

describe('regression', () => {
  it('goes back one step, at the top of its range, after 2 sessions under the bottom', () => {
    const { state, events } = run({ ...pullUp(), sessionsAtLevel: 2 }, [[[3, 2, 2]], [[2, 2, 1]]])
    expect(state).toMatchObject({ level: 3, targets: [6, 6, 6], sessionsAtLevel: 0 })
    expect(events).toContainEqual({ type: 'regressed', ladderId: 'pull-vertical', from: 4, to: 3 })
  })

  it('counts too-hard sessions as regress sessions', () => {
    expect(
      run(pullUp(), [
        [[4, 4, 4], 'too-hard'],
        [[4, 4, 4], 'too-hard'],
      ]).state.level,
    ).toBe(3)
  })

  it('needs both sessions in a row', () => {
    expect(run(pullUp(), [[[2, 2, 2]], [[3, 3, 3]], [[2, 2, 2]]]).state.level).toBe(4)
  })

  it('stays at level 1, back to the bottom', () => {
    const wall = placeAtLevel('push', 1)
    const { state } = run({ ...wall, targets: [12, 12, 12] }, [[[9, 9, 9]], [[8, 8, 8]]])
    expect(state).toMatchObject({ level: 1, targets: [10, 10, 10] })
  })

  it('treats missing sets as under the bottom', () => {
    expect(run(pullUp(), [[[3, 3]], [[3]]]).state.level).toBe(3)
  })
})

describe('calibration', () => {
  it('jumps to the top of the range when the first session of a step is too easy', () => {
    const { state, events } = run(pullUp(), [[[5, 5, 5], 'too-easy']])
    expect(state.targets).toEqual([8, 8, 8])
    expect(events[0]).toMatchObject({ type: 'calibrated' })
  })

  it('only on the first session', () => {
    expect(run(pullUp(), [[[3, 3, 3]], [[5, 5, 5], 'too-easy']]).state.targets).toEqual([3, 4, 4])
  })
})

describe('pain', () => {
  it('drops one step for the next session and freezes the ladder', () => {
    const { state, events } = run(pullUp(), [[[3, 3, 3], 'right', true]])
    expect(state).toMatchObject({ level: 3, targets: [3, 3, 3], frozen: true })
    expect(events[0]).toEqual({ type: 'pain-drop', ladderId: 'pull-vertical', from: 4, to: 3 })
  })

  it('makes no progression while frozen', () => {
    const frozen = { ...pullUp(), frozen: true }
    const { state, events } = run(frozen, [[[8, 8, 8]], [[8, 8, 8]]])
    expect(state.targets).toEqual([3, 3, 3])
    expect(state.stepUpProposed).toBe(false)
    expect(events.every((e) => e.type === 'frozen')).toBe(true)
  })
})

describe('semaine allégée', () => {
  it('makes no progression', () => {
    const outcome = applyResult(pullUp(), result(pullUp(), [8, 8, 8]), { deload: true })
    expect(outcome.state.targets).toEqual([3, 3, 3])
    expect(outcome.events).toEqual([{ type: 'held', ladderId: 'pull-vertical', level: 4 }])
  })
})

describe('cumulative free handstand', () => {
  // handstand-balance L3: ds:3302, cumulative 30-90 s, mastered with 3 holds of 15 s.
  const free = () => ({ ...placeAtLevel('handstand-balance', 3, true) })

  it('compares the total of the holds with the range', () => {
    const { state } = run(free(), [[[10, 12, 9]]])
    expect(state.targets).toEqual([35])
  })

  it('reports the skill as mastered with 3 holds of 15 s', () => {
    const { events } = run(free(), [[[16, 15, 20, 8]]])
    expect(events).toContainEqual({ type: 'skill-mastered', ladderId: 'handstand-balance' })
  })
})

describe('skill entry', () => {
  it('opens the handstand once the hollow body reaches 20 s', () => {
    let states = placeLadders({})
    states = { ...states, 'core-isometric': { ...placeAtLevel('core-isometric', 3), lastValues: [15, 20, 20] } }
    expect(entryMet('handstand-balance', states)).toBe(false)
    states['core-isometric'] = { ...states['core-isometric'], lastValues: [20, 22, 25] }
    expect(entryMet('handstand-balance', states)).toBe(true)
    expect(unlockLadders(states).unlocked).toContain('handstand-balance')
  })

  it('needs every condition for the muscle-up', () => {
    const states = placeLadders({})
    states['pull-vertical'] = { ...placeAtLevel('pull-vertical', 5) }
    expect(conditionHolds({ ladder: 'pull-vertical', level: 4, atTopOfRange: true }, states)).toBe(true)
    expect(entryMet('muscle-up', states)).toBe(false) // hollow body not there yet
  })

  it('opens the handstand push-up track from 6 decline push-ups', () => {
    const states = placeLadders({})
    states.push = { ...placeAtLevel('push', 6), lastValues: [6, 7, 6] }
    expect(entryMet('handstand-strength', states)).toBe(true)
  })
})

describe('re-entry after a long break', () => {
  it('goes back one step at the top of its range', () => {
    expect(reenter(pullUp())).toMatchObject({ level: 3, targets: [6, 6, 6] })
    expect(reenter(placeAtLevel('push', 1))).toMatchObject({ level: 1, targets: [10, 10, 10] })
  })
})
