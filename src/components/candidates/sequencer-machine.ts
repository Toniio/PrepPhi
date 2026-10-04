import type { Sequence } from '@/engine'

// The sequencer's state machine, pure so it can be tested without timers:
// blocks run in order, the whole list repeats `rounds` times.

export type SequencerState = {
  round: number
  block: number
  /** Milliseconds left in the current block. */
  remainingMs: number
  running: boolean
  finished: boolean
}

export type SequencerEvent =
  | { type: 'block-start'; round: number; block: number }
  | { type: 'countdown'; secondsLeft: number }
  | { type: 'finished' }

export function initialState(sequence: Sequence): SequencerState {
  return { round: 1, block: 0, remainingMs: (sequence.blocks[0]?.seconds ?? 0) * 1000, running: false, finished: false }
}

/** Advances by `elapsedMs`; may cross several blocks. Returns the events crossed. */
export function tick(
  sequence: Sequence,
  state: SequencerState,
  elapsedMs: number,
): { state: SequencerState; events: SequencerEvent[] } {
  if (!state.running || state.finished) return { state, events: [] }
  const events: SequencerEvent[] = []
  let { round, block, remainingMs } = state
  let left = elapsedMs

  while (left > 0) {
    const before = Math.ceil(remainingMs / 1000)
    if (left < remainingMs) {
      remainingMs -= left
      const after = Math.ceil(remainingMs / 1000)
      if (after < before && after <= 3 && after > 0) events.push({ type: 'countdown', secondsLeft: after })
      left = 0
      break
    }
    left -= remainingMs
    block += 1
    if (block >= sequence.blocks.length) {
      block = 0
      round += 1
    }
    if (round > sequence.rounds) {
      events.push({ type: 'finished' })
      return {
        state: {
          round: sequence.rounds,
          block: sequence.blocks.length - 1,
          remainingMs: 0,
          running: false,
          finished: true,
        },
        events,
      }
    }
    remainingMs = sequence.blocks[block].seconds * 1000
    events.push({ type: 'block-start', round, block })
  }
  return { state: { ...state, round, block, remainingMs }, events }
}

/** Jumps to the start of the next block, keeping the running state. */
export function skip(sequence: Sequence, state: SequencerState): { state: SequencerState; events: SequencerEvent[] } {
  const result = tick(sequence, { ...state, running: true }, state.remainingMs)
  return {
    state: result.state.finished ? result.state : { ...result.state, running: state.running },
    events: result.events,
  }
}

export function totalSeconds(sequence: Sequence): number {
  return sequence.rounds * sequence.blocks.reduce((sum, b) => sum + b.seconds, 0)
}

export function formatClock(ms: number): string {
  const seconds = Math.max(0, Math.ceil(ms / 1000))
  const m = Math.floor(seconds / 60)
  const s = String(seconds % 60).padStart(2, '0')
  return `${m}:${s}`
}
