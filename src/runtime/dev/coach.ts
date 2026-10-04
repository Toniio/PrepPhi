import { CoachError, type CoachClient, type CoachRequest } from '../types'

const CHUNK = 24
const STEP_MS = 30

function wait(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) return reject(new CoachError('cancelled', 'cancelled'))
    const timer = setTimeout(resolve, ms)
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer)
        reject(new CoachError('cancelled', 'cancelled'))
      },
      { once: true },
    )
  })
}

/**
 * The scripted development coach: answers `request.devReply()` and streams
 * it in small chunks, so loading and streaming states show up in dev.
 */
export function createDevCoach(): CoachClient {
  async function stream(request: CoachRequest): Promise<string> {
    const reply = request.devReply()
    await wait(400, request.signal)
    for (let end = CHUNK; end < reply.length + CHUNK; end += CHUNK) {
      request.onText?.(reply.slice(0, Math.min(end, reply.length)))
      await wait(STEP_MS, request.signal)
    }
    return reply
  }

  return {
    available: true,
    text: stream,
    async json<T>(request: CoachRequest) {
      const reply = await stream(request)
      try {
        return JSON.parse(reply) as T
      } catch {
        throw new CoachError('invalid_json', 'dev reply is not JSON', reply)
      }
    },
  }
}
