import type { Runtime } from '../types'
import { createDevCalendar } from './calendar'
import { createDevCoach } from './coach'
import { createDevDownloader } from './downloader'
import { createDevStore } from './store'

/** Everything local: scripted coach, localStorage, fake calendar. */
export function createDevRuntime(): Runtime {
  const store = createDevStore()
  return {
    kind: 'dev',
    coach: createDevCoach(),
    store,
    calendar: createDevCalendar(store),
    downloader: createDevDownloader(),
  }
}
