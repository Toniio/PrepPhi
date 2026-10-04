import type { DeloadTrigger, Family } from '@/engine'

export const TRIGGERS: Record<DeloadTrigger, string> = {
  'too-hard-count': '3 exercices ou plus notés trop durs',
  'double-regress': 'des retours au palier précédent dans 2 familles',
  'rpe-elliptical': 'un effort perçu de 7 ou plus sur 2 séances d’elliptique de suite',
  'hr-drift': 'une fréquence cardiaque à l’elliptique 8 bpm au-dessus de ta moyenne',
}

export const FAMILIES: Record<Family, string> = {
  pull: 'tirage',
  push: 'poussée',
  legs: 'jambes',
  core: 'gainage',
  skill: 'skills',
}

export function list(items: string[]): string {
  if (items.length <= 1) return items.join('')
  return `${items.slice(0, -1).join(', ')} et ${items.at(-1)}`
}
