import { useEffect, useState, type ReactNode } from 'react'
import { createRuntime } from '.'
import { RuntimeContext } from './context'
import type { Runtime } from './types'

type Props = {
  children: ReactNode
  /** Shown while the capabilities resolve (up to 10 s in a silent host). */
  fallback: ReactNode
  /** Injects a runtime, for tests. */
  runtime?: Runtime
}

export function RuntimeProvider({ children, fallback, runtime: injected }: Props) {
  const [runtime, setRuntime] = useState<Runtime | null>(injected ?? null)

  useEffect(() => {
    if (injected) return
    let alive = true
    createRuntime().then((created) => {
      if (alive) setRuntime(created)
    })
    return () => {
      alive = false
    }
  }, [injected])

  if (!runtime) return fallback
  return <RuntimeContext.Provider value={runtime}>{children}</RuntimeContext.Provider>
}
