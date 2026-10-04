import { createContext, useContext } from 'react'
import type { Runtime } from './types'

export const RuntimeContext = createContext<Runtime | null>(null)

/** The runtime services. Only valid under `<RuntimeProvider>`. */
export function useRuntime(): Runtime {
  const runtime = useContext(RuntimeContext)
  if (!runtime) throw new Error('useRuntime must be used under <RuntimeProvider>')
  return runtime
}
