import type { Runtime } from '../types'
import { createClaudeCalendar } from './calendar'
import { createClaudeCoach } from './coach'
import { createClaudeDownloader } from './downloader'
import { createClaudeStore } from './store'

/**
 * The runtime inside the claude.ai viewer. Each capability may resolve
 * `null` (not served, not granted, failed to load): the matching service
 * then reports `available: false` and the screens degrade.
 */
export async function createClaudeRuntime(claude: Claude): Promise<Runtime> {
  const [sample, db, user, mcp, downloads] = await Promise.all([
    claude.use('sample'),
    claude.use('db'),
    claude.use('user'),
    claude.use('mcp'),
    claude.use('downloads'),
  ])
  const userId = user ? await user.id() : null

  return {
    kind: 'claude',
    coach: createClaudeCoach(sample),
    store: createClaudeStore(db, userId),
    calendar: createClaudeCalendar(mcp),
    downloader: createClaudeDownloader(downloads),
  }
}
