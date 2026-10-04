import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { today as localToday } from '@/engine'
import { useRuntime } from '@/runtime/context'
import { ensureWeek } from './actions'
import { AppDataContext } from './context'
import { clearData, loadData, saveChanges } from './repository'
import { emptyData, type AppData } from './schema'

type Props = {
  children: ReactNode
  loading: ReactNode
  failed: (retry: () => void) => ReactNode
}

export function AppDataProvider({ children, loading, failed }: Props) {
  const { store } = useRuntime()
  const [data, setData] = useState<AppData | null>(null)
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const current = useRef<AppData | null>(null)
  const today = localToday()

  useEffect(() => {
    let alive = true
    loadData(store)
      .then(async (loaded) => {
        const ready = ensureWeek(loaded, today)
        if (ready !== loaded) await saveChanges(store, loaded, ready)
        if (!alive) return
        current.current = ready
        setData(ready)
      })
      .catch(() => {
        if (alive) setError(true)
      })
    return () => {
      alive = false
    }
  }, [store, today, attempt])

  const update = useCallback(
    async (change: (data: AppData) => AppData) => {
      const before = current.current
      if (!before) return
      const after = change(before)
      if (after === before) return
      current.current = after
      setData(after)
      await saveChanges(store, before, after)
    },
    [store],
  )

  const replaceAll = useCallback(
    async (next: AppData) => {
      await clearData(store)
      const ready = ensureWeek(next, today)
      await saveChanges(store, emptyData(), ready)
      current.current = ready
      setData(ready)
    },
    [store, today],
  )

  if (error) {
    return failed(() => {
      setError(false)
      setAttempt((n) => n + 1)
    })
  }
  if (!data) return loading
  return <AppDataContext.Provider value={{ data, today, update, replaceAll }}>{children}</AppDataContext.Provider>
}
