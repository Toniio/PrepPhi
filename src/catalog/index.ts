import hdExercises from '../../data/hd-exercises.json'
import catalog from '../data/catalog.json'
import type { Context } from '@/engine'

// The closed exercise catalog: the dataset exercises (with animated media)
// and the hors-dataset sheets of data/hd-exercises.json (text and video).

export type ExerciseInfo = {
  id: string
  nameFr: string
  stepsFr: string[]
  cueFr: string | null
  mistakeFr: string | null
  /** When the animation shows other equipment than Anthony's. */
  noteFr: string | null
  mediaUrl: string | null
  videoUrl: string | null
  videoSearchUrl: string | null
  attribution: string | null
  target: string | null
  equipment: string[]
  contexts: Context[]
}

// Every WebP is inlined in the single-file build.
const MEDIA = import.meta.glob<string>('../assets/exercises/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
})

function mediaFor(path: string): string | null {
  return MEDIA[`../assets/${path}`] ?? null
}

const BY_ID = new Map<string, ExerciseInfo>()

for (const e of catalog.exercises) {
  const extra = e as typeof e & { cueFr?: string; mistakeFr?: string; noteFr?: string }
  BY_ID.set(e.id, {
    id: e.id,
    nameFr: e.nameFr ?? e.nameEn,
    stepsFr: e.stepsFr.filter((step) => !step.startsWith('Répète')),
    cueFr: extra.cueFr ?? null,
    mistakeFr: extra.mistakeFr ?? null,
    noteFr: extra.noteFr ?? null,
    mediaUrl: mediaFor(e.media),
    videoUrl: null,
    videoSearchUrl: null,
    attribution: e.attribution,
    target: e.target,
    equipment: e.equipment,
    contexts: e.contexts as Context[],
  })
}

for (const e of hdExercises.exercises) {
  BY_ID.set(e.id, {
    id: e.id,
    nameFr: e.nameFr,
    stepsFr: e.stepsFr,
    cueFr: e.cueFr,
    mistakeFr: e.mistakeFr,
    noteFr: null,
    mediaUrl: null,
    videoUrl: e.videoUrl,
    videoSearchUrl: e.videoSearchUrl,
    attribution: null,
    target: null,
    equipment: e.equipment,
    contexts: e.contexts as Context[],
  })
}

export function getExercise(id: string): ExerciseInfo {
  const info = BY_ID.get(id)
  if (!info) throw new Error(`Unknown exercise "${id}"`)
  return info
}

/** For the planner: can this exercise be done here? A park allows home equipment too. */
export function isAvailable(exerciseId: string, context: Context): boolean {
  const info = BY_ID.get(exerciseId)
  if (!info) return false
  if (context === 'park') return info.contexts.includes('park') || info.contexts.includes('home')
  return info.contexts.includes(context)
}

/** Demo data shows only exercises with an animated media: the hors-dataset sheets have none. */
export function isAvailableWithAnimation(exerciseId: string, context: Context): boolean {
  return BY_ID.get(exerciseId)?.mediaUrl != null && isAvailable(exerciseId, context)
}

/**
 * Accessories the coach may add, grouped by muscle group (target), home
 * exercises only. The coach gets this pool and the ladders, never the whole
 * catalog (CLAUDE.md).
 */
export function accessoryPool(perGroup = 6): Record<string, { id: string; nameFr: string }[]> {
  const pool: Record<string, { id: string; nameFr: string }[]> = {}
  for (const info of BY_ID.values()) {
    if (!info.id.startsWith('ds:') || !info.target || !info.contexts.includes('home')) continue
    if (info.target === 'cardiovascular system') continue
    const group = (pool[info.target] ??= [])
    if (group.length < perGroup) group.push({ id: info.id, nameFr: info.nameFr })
  }
  return pool
}

export const CATALOG_SIZE = catalog.exercises.length
