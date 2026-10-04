// Dark mode is the `.dark` class on <html> (DS convention). The claude.ai
// viewer states its theme in the `data-theme` attribute of <html>; outside
// the viewer, the system preference decides. JS only: no conditional CSS.

export function prefersDark(root: HTMLElement, systemDark: boolean): boolean {
  const theme = root.getAttribute('data-theme')
  if (theme === 'dark') return true
  if (theme === 'light') return false
  return systemDark
}

/** Applies the theme now and on every change. Returns the stop function. */
export function startThemeSync(
  root: HTMLElement = document.documentElement,
  // The one place that reads the system preference: it only sets the .dark class.
  // eslint-disable-next-line dsaireadable/no-raw-values
  media: MediaQueryList = window.matchMedia('(prefers-color-scheme: dark)'),
): () => void {
  const apply = () => root.classList.toggle('dark', prefersDark(root, media.matches))
  apply()
  const observer = new MutationObserver(apply)
  observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] })
  media.addEventListener('change', apply)
  return () => {
    observer.disconnect()
    media.removeEventListener('change', apply)
  }
}
