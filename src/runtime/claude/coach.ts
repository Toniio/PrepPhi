import { CoachError, type CoachClient, type CoachErrorCode, type CoachRequest } from '../types'

type Sample = typeof Claude.sample

const HIDE_CODES = new Set([
  'not_granted',
  'sampling_disabled',
  'not_declared',
  'capability_disabled',
  'capability_removed',
])

function toCoachError(error: unknown): CoachError {
  const e = error as Partial<Claude.sample.SampleError>
  const code: CoachErrorCode =
    e.code === 'cancelled'
      ? 'cancelled'
      : e.code === 'rate_limited'
        ? 'rate_limited'
        : e.code === 'invalid_json'
          ? 'invalid_json'
          : e.code && HIDE_CODES.has(e.code)
            ? 'not_granted'
            : 'failed'
  return new CoachError(code, e.message ?? 'Coach call failed', e.text)
}

function options(request: CoachRequest): Claude.sample.SampleOptions {
  return {
    modelTier: request.modelTier,
    signal: request.signal,
    onText: request.onText ? ({ text }) => request.onText?.(text) : undefined,
    // Every turn of a chat must get a fresh answer.
    cache: request.purpose === 'chat' ? false : undefined,
  }
}

/** The coach through the `sample` capability, on Anthony's own Claude account. */
export function createClaudeCoach(sample: Sample | null): CoachClient {
  return {
    available: sample !== null,

    async text(request) {
      if (!sample) throw new CoachError('unavailable', 'sample capability unavailable')
      try {
        const { text } = await sample(request.input, options(request))
        return text
      } catch (error) {
        throw toCoachError(error)
      }
    },

    async json<T>(request: CoachRequest) {
      if (!sample) throw new CoachError('unavailable', 'sample capability unavailable')
      try {
        return await sample.json<T>(request.input, options(request))
      } catch (error) {
        throw toCoachError(error)
      }
    },
  }
}
