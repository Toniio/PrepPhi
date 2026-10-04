import { createClaudeRuntime } from './claude'
import { createDevRuntime } from './dev'
import type { Runtime } from './types'

export * from './types'

/**
 * Picks the runtime: the claude.ai one when the viewer provides
 * `window.claude`, the development one otherwise (`npm run dev`, the built
 * file opened locally). `?runtime=dev` forces the development runtime.
 */
export async function createRuntime(): Promise<Runtime> {
  const forced = new URLSearchParams(window.location.search).get('runtime')
  const claude = (window as Partial<Window>).claude
  if (forced !== 'dev' && typeof claude?.use === 'function') {
    return createClaudeRuntime(claude)
  }
  return createDevRuntime()
}
