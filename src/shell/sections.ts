import { useEffect, useState } from 'react'

export type Section = 'today' | 'week' | 'review' | 'progress' | 'data'

const HASHES: Record<Section, string> = {
  today: '#aujourdhui',
  week: '#semaine',
  review: '#revue',
  progress: '#progression',
  data: '#donnees',
}

function fromHash(hash: string): Section {
  const found = (Object.keys(HASHES) as Section[]).find((s) => HASHES[s] === hash)
  return found ?? 'today'
}

/** The current section, kept in the URL hash so a reload stays on it. */
export function useSection(): [Section, (section: Section) => void] {
  const [section, setSection] = useState<Section>(() => fromHash(window.location.hash))

  useEffect(() => {
    const onChange = () => setSection(fromHash(window.location.hash))
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  const go = (next: Section) => {
    if (HASHES[next] !== window.location.hash) window.history.pushState(null, '', HASHES[next])
    setSection(next)
    window.scrollTo({ top: 0 })
  }
  return [section, go]
}
