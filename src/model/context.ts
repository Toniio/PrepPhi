import { createContext, useContext } from 'react'
import type { AppData } from './schema'

export type AppDataContextValue = {
  data: AppData
  today: string
  /** Applies a pure update and writes the documents it changed. */
  update: (change: (data: AppData) => AppData) => Promise<void>
  /** Replaces everything, for the JSON import. */
  replaceAll: (data: AppData) => Promise<void>
}

export const AppDataContext = createContext<AppDataContextValue | null>(null)

export function useAppData(): AppDataContextValue {
  const value = useContext(AppDataContext)
  if (!value) throw new Error('useAppData must be used under <AppDataProvider>')
  return value
}
