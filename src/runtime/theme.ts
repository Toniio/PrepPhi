// Dark mode is the `.dark` class on <html> (DS convention). The reader picks
// one of three modes in the sidebar:
//   - `system`: the claude.ai viewer states its theme in the `data-theme`
//     attribute of <html>; outside the viewer, the system preference decides;
//   - `light` or `dark`: the reader's choice, which wins over both.
// JS only: no conditional CSS.

export type ThemePreference = 'system' | 'light' | 'dark'

export const THEME_PREFERENCES: ThemePreference[] = ['system', 'light', 'dark']

const STORAGE_KEY = 'prepphi:theme'

type PreferenceStorage = Pick<Storage, 'getItem' | 'setItem'>

function isPreference(value: unknown): value is ThemePreference {
  return THEME_PREFERENCES.includes(value as ThemePreference)
}

// Browser storage can be missing or throw (private window, blocked site data,
// sandboxed viewer): the choice then lasts until the page closes.
function browserStorage(): PreferenceStorage | null {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export function readPreference(storage: PreferenceStorage | null = browserStorage()): ThemePreference {
  try {
    const stored = storage?.getItem(STORAGE_KEY)
    return isPreference(stored) ? stored : 'system'
  } catch {
    return 'system'
  }
}

export function prefersDark(root: HTMLElement, systemDark: boolean): boolean {
  const theme = root.getAttribute('data-theme')
  if (theme === 'dark') return true
  if (theme === 'light') return false
  return systemDark
}

/** Whether the page is dark: the reader's choice, else the viewer's theme, else the system's. */
export function resolveDark(root: HTMLElement, systemDark: boolean, preference: ThemePreference): boolean {
  if (preference === 'dark') return true
  if (preference === 'light') return false
  return prefersDark(root, systemDark)
}

// -- The reader's choice, shared by the sync and the sidebar control ------------------------

let preference: ThemePreference = readPreference()
const listeners = new Set<() => void>()

export function getThemePreference(): ThemePreference {
  return preference
}

export function subscribeThemePreference(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function setThemePreference(next: ThemePreference, storage: PreferenceStorage | null = browserStorage()): void {
  if (next === preference) return
  preference = next
  try {
    storage?.setItem(STORAGE_KEY, next)
  } catch {
    // The choice still applies for this visit.
  }
  listeners.forEach((listener) => listener())
}

/** Applies the theme now and on every change. Returns the stop function. */
export function startThemeSync(
  root: HTMLElement = document.documentElement,
  // The one place that reads the system preference: it only sets the .dark class.
  // eslint-disable-next-line dsaireadable/no-raw-values
  media: MediaQueryList = window.matchMedia('(prefers-color-scheme: dark)'),
): () => void {
  const apply = () => root.classList.toggle('dark', resolveDark(root, media.matches, preference))
  apply()
  const observer = new MutationObserver(apply)
  observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] })
  media.addEventListener('change', apply)
  const stopListening = subscribeThemePreference(apply)
  return () => {
    observer.disconnect()
    media.removeEventListener('change', apply)
    stopListening()
  }
}
