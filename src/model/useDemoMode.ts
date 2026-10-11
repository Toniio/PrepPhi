import { useCallback } from 'react'
import { buildDemoData } from '@/demo'
import { useRuntime } from '@/runtime/context'
import { useAppData } from './context'
import { popStash, stashData } from './repository'

/**
 * Turns the demo on and off without losing the real data: turning it on puts
 * the real data aside, turning it off brings it back and drops the demo.
 */
export function useDemoMode() {
  const { store } = useRuntime()
  const { data, today, replaceAll } = useAppData()
  const isDemo = data.profile?.demo === true

  const enter = useCallback(async () => {
    await stashData(store, data)
    await replaceAll(buildDemoData(today))
  }, [store, data, today, replaceAll])

  const leave = useCallback(async () => {
    await replaceAll(await popStash(store))
  }, [store, replaceAll])

  /** Starts the demo over from today; the stashed real data stays put. */
  const restart = useCallback(() => replaceAll(buildDemoData(today)), [today, replaceAll])

  return { isDemo, enter, leave, restart }
}
