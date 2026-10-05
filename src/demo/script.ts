import type { Feeling, IsoDate, Profile } from '@/engine'

// The story of the demo data (src/demo/build.ts): a fictional person who has
// used PrepPhi for three weeks. Fictional on purpose: nothing here is Anthony's.

/** Where each ladder starts, three weeks before today. Every step used has an animation. */
export const START_LEVELS: Record<string, { level: number; unlocked?: boolean; lastValues?: number[] }> = {
  'pull-vertical': { level: 4 },
  'pull-horizontal': { level: 2 },
  push: { level: 6, lastValues: [8, 8, 8] },
  'legs-front': { level: 4 },
  'legs-posterior': { level: 2 },
  'core-hanging': { level: 3 },
  // No step of this ladder has an animation: the demo plans none of it, but
  // its level opens the two handstand ladders, as the rules require.
  'core-isometric': { level: 3, lastValues: [30, 30, 30] },
  'handstand-balance': { level: 3, unlocked: true },
  'handstand-strength': { level: 3, unlocked: true },
  'muscle-up': { level: 1 },
}

export function demoProfile(createdAt: IsoDate): Profile {
  return {
    createdAt,
    availableDays: [1, 2, 3, 4, 5, 6, 7],
    calisthenicsPerWeek: 3,
    ellipticalPerWeek: 2,
    parkSessions: true,
    barLengthCm: 80,
    restingHr: 58,
    maxHr: 188,
    age: 34,
    ellipticalResistance: { min: 1, max: 16 },
    freeWallAtHome: true,
    preferredTime: '18:30',
    demo: true,
  }
}

// -- What happens in the sessions ----------------------------------------------------

export type Mode =
  /** The targets, exactly. */
  | 'meet'
  /** The top of the range on every set. */
  | 'top'
  /** The targets, one rep short on the last set. */
  | 'short'

export type Performance = { mode: Mode; feeling: Feeling }

/** Ladders that reach the top of their range in the last week: their next step gets proposed. */
const TOP_IN_LAST_WEEK = new Set(['push', 'core-hanging', 'handstand-strength'])

/**
 * `week` is 0 to 2 (oldest first); `nth` counts the ladder's sessions since
 * the start, `nthInWeek` those of the week.
 */
export function performanceOf(input: {
  ladderId: string
  level: number
  week: number
  nth: number
  nthInWeek: number
}): Performance {
  const { ladderId, level, week, nth, nthInWeek } = input
  // First pull-up session: far too easy, the targets jump to the top of the range.
  if (ladderId === 'pull-vertical' && level === 4 && nth === 0) return { mode: 'meet', feeling: 'too-easy' }
  // Travel week: one hard set of lunges, the only one of the week.
  if (ladderId === 'legs-front' && week === 1 && nthInWeek === 0) return { mode: 'short', feeling: 'too-hard' }
  if (week === 2 && TOP_IN_LAST_WEEK.has(ladderId)) return { mode: 'top', feeling: 'right' }
  return { mode: 'meet', feeling: 'right' }
}

/**
 * The free handstand is logged as its holds. One of 15 s, the rest shorter:
 * three holds of 15 s would master the skill, which is not the story.
 */
export function handstandHolds(total: number): number[] {
  const holds = [Math.min(15, total)]
  const rest = total - holds[0]
  if (rest <= 0) return holds
  const count = Math.ceil(rest / 14)
  const base = Math.floor(rest / count)
  const extra = rest % count
  for (let i = 0; i < count; i += 1) holds.push(base + (i < extra ? 1 : 0))
  return holds
}

// -- Weeks -----------------------------------------------------------------------------

/** Day of the week (1 = Monday) the Paris trip starts and ends, in the second week. */
export const TRIP_DAYS: [number, number] = [4, 5]

/** Average heart rate of the two elliptical sessions of each week (zone 136 to 149 bpm). */
export const ELLIPTICAL_HR: [number, number][] = [
  [147, 145],
  [146, 144],
  [145, 143],
]

/** Accessories the coach adds to the sessions A and B of the weeks it planned, from the pool. */
export const ACCESSORIES: Record<'A' | 'B', { exercise: string; sets: number; target: number }[]> = {
  A: [
    { exercise: 'ds:3021', sets: 2, target: 10 }, // pompe scapulaire
    { exercise: 'ds:1373', sets: 2, target: 15 }, // extension des mollets debout
  ],
  B: [{ exercise: 'ds:0489', sets: 2, target: 12 }], // extension lombaire au sol
}

// -- The conversations of the reviews --------------------------------------------------

export type Chat = { question: string; answer: string }

export const REVIEW_CHATS: Chat[] = [
  {
    question: 'Pourquoi l’elliptique passe à 35 minutes ?',
    answer:
      'Tes deux séances étaient à 30 minutes, avec un effort perçu de 4 et une fréquence cardiaque dans ta zone, entre 136 et 149 bpm. Dans ce cas, la règle ajoute 5 minutes par semaine, jusqu’à 45 minutes. Je garde ce pas.',
  },
  {
    question: 'J’ai mal dormi pendant le déplacement. Je dois alléger la semaine ?',
    answer:
      'Non. La semaine allégée se déclenche sur des signaux précis : 3 exercices notés trop durs, des retours de palier dans 2 familles, un effort perçu de 7 ou plus deux fois de suite, ou une fréquence cardiaque 8 bpm au-dessus de ta moyenne. Cette semaine, un seul exercice était trop dur. Je garde le plan.',
  },
  {
    question: 'Pourquoi un palier suivant est proposé ?',
    answer:
      'Tu as tenu le haut de la fourchette sur toutes les séries, deux séances de suite, sans noter l’exercice trop dur. La règle propose alors le palier suivant, qui repart du bas de sa fourchette. C’est toi qui décides, dans « À décider ».',
  },
]

/** Proposals of the coach: the first one was accepted, the second waits. */
export const PROPOSALS = [
  'Ajouter un palier entre la traction pronation et la traction prise large : la marche est haute.',
  'Passer la fourchette du relevé de jambes suspendu de 6–12 à 8–15 répétitions.',
]
