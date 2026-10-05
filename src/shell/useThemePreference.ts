import { useSyncExternalStore } from 'react'
import { getThemePreference, subscribeThemePreference, type ThemePreference } from '@/runtime/theme'

/** The reader's current theme choice, kept in step with the sidebar control. */
export function useThemePreference(): ThemePreference {
  return useSyncExternalStore(subscribeThemePreference, getThemePreference, () => 'system')
}
