// French strings of the interface (docs/redaction-fr.md). The DS components
// keep their English defaults: every screen passes these through the
// override props.

import type { Feeling } from '@/engine'

export const DS = {
  sidebar: {
    toggle: 'Afficher ou masquer le menu',
    mobileTitle: 'Menu',
    mobileDescription: 'Les sections de PrepPhi.',
  },
  questionnaire: {
    progress: 'Progression du questionnaire',
    previous: 'Précédent',
    skip: 'Passer',
    next: 'Suivant',
    submit: 'Terminer',
  },
  messageScroller: {
    viewport: 'Conversation avec le coach',
    scrollToEnd: 'Aller au dernier message',
    scrollToStart: 'Aller au premier message',
  },
  close: 'Fermer',
  spinner: 'Chargement',
} as const

export const FEELINGS: { value: Feeling; label: string }[] = [
  { value: 'too-easy', label: 'Trop facile' },
  { value: 'right', label: 'Juste bien' },
  { value: 'too-hard', label: 'Trop dur' },
]

export const SECTIONS = {
  today: 'Aujourd’hui',
  week: 'Semaine',
  review: 'Revue',
  progress: 'Progression',
  data: 'Données',
} as const

export const WEEKDAYS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']

const MONTHS = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
]

/** `lundi 6 octobre`. */
export function formatDay(date: string): string {
  const [y, m, d] = date.split('-').map(Number)
  const weekday = new Date(Date.UTC(y, m - 1, d, 12)).getUTCDay()
  return `${WEEKDAYS[(weekday + 6) % 7]} ${d} ${MONTHS[m - 1]}`
}

/** `Lundi 6 octobre`, at the start of a sentence or a title. */
export function formatDayTitle(date: string): string {
  const text = formatDay(date)
  return text.charAt(0).toUpperCase() + text.slice(1)
}

const NBSP = ' '

/** `8 rép.`, `30 s`, `8 rép. par côté`. */
export function formatValue(value: number, unit: 'reps' | 's'): string {
  return unit === 's' ? `${value}${NBSP}s` : `${value}${NBSP}rép.`
}

/** `3 × 8–12`, `3 × 30–60 s`. */
export function formatTargets(targets: number[], unit: 'reps' | 's', perSide = false): string {
  const low = Math.min(...targets)
  const high = Math.max(...targets)
  const value = low === high ? `${low}` : `${low}–${high}`
  const suffix = unit === 's' ? `${NBSP}s` : ''
  return `${targets.length}${NBSP}×${NBSP}${value}${suffix}${perSide ? ' par côté' : ''}`
}

/** `8–12 rép.`, `30–60 s`, `4–8 rép. par côté`. */
export function formatRange(range: [number, number], unit: 'reps' | 's', perSide = false): string {
  return `${range[0]}–${range[1]}${NBSP}${unit === 's' ? 's' : 'rép.'}${perSide ? ' par côté' : ''}`
}

export function formatMinutes(minutes: number): string {
  return `${minutes}${NBSP}min`
}

export const LEVEL = (level: number) => `Palier ${level}`
