import { describe, expect, it } from 'vitest'
import type { Sequence } from '@/engine'
import { formatClock, initialState, skip, tick, totalSeconds } from './sequencer-machine'

const intervals: Sequence = {
  label: 'Fractionné',
  rounds: 2,
  blocks: [
    { label: 'Rapide', seconds: 60, kind: 'work' },
    { label: 'Récupération', seconds: 120, kind: 'rest' },
  ],
}

const running = () => ({ ...initialState(intervals), running: true })

describe('sequencer machine', () => {
  it('counts down and beeps on the last 3 seconds', () => {
    const { state, events } = tick(intervals, running(), 57_500)
    expect(state.remainingMs).toBe(2_500)
    expect(events).toEqual([{ type: 'countdown', secondsLeft: 3 }])
  })

  it('moves to the next block, then the next round', () => {
    let state = tick(intervals, running(), 60_000).state
    expect(state).toMatchObject({ round: 1, block: 1, remainingMs: 120_000 })
    state = tick(intervals, state, 120_000).state
    expect(state).toMatchObject({ round: 2, block: 0 })
  })

  it('finishes after the last round', () => {
    const { state, events } = tick(intervals, running(), totalSeconds(intervals) * 1000)
    expect(state.finished).toBe(true)
    expect(events.at(-1)).toEqual({ type: 'finished' })
  })

  it('does nothing while paused', () => {
    const paused = initialState(intervals)
    expect(tick(intervals, paused, 10_000).state).toBe(paused)
  })

  it('skips to the next block and keeps the pause', () => {
    const { state, events } = skip(intervals, initialState(intervals))
    expect(state).toMatchObject({ block: 1, running: false })
    expect(events).toEqual([{ type: 'block-start', round: 1, block: 1 }])
  })

  it('formats the clock', () => {
    expect(formatClock(90_000)).toBe('1:30')
    expect(formatClock(4_200)).toBe('0:05')
    expect(totalSeconds(intervals)).toBe(360)
  })
})
