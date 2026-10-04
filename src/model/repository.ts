import type { CardioEntry, EllipticalState, LadderState, Profile } from '@/engine'
import type { Store } from '@/runtime'
import {
  emptyData,
  KEYS,
  SCHEMA_VERSION,
  type AppData,
  type Proposal,
  type ReviewRecord,
  type ReviewSummary,
  type WeekDoc,
} from './schema'

/** Reads every document of the store into one AppData. */
export async function loadData(store: Store): Promise<AppData> {
  const data = emptyData()
  const [profile, ladderState, elliptical, reviewSummary, proposals, keys] = await Promise.all([
    store.get<Profile>(KEYS.profile),
    store.get<Record<string, LadderState>>(KEYS.ladderState),
    store.get<EllipticalState>(KEYS.elliptical),
    store.get<ReviewSummary>(KEYS.reviewSummary),
    store.get<Proposal[]>(KEYS.proposals),
    store.keys(),
  ])
  data.profile = profile
  data.ladderState = ladderState ?? {}
  data.elliptical = elliptical
  data.reviewSummary = reviewSummary
  data.proposals = proposals ?? []

  const weekKeys = keys.filter((k) => k.startsWith('week-'))
  const reviewKeys = keys.filter((k) => k.startsWith('review-') && k !== KEYS.reviewSummary)
  const cardioKeys = keys.filter((k) => k.startsWith('cardio-'))
  const [weeks, reviews, cardio] = await Promise.all([
    Promise.all(weekKeys.map((k) => store.get<WeekDoc>(k))),
    Promise.all(reviewKeys.map((k) => store.get<ReviewRecord>(k))),
    Promise.all(cardioKeys.map((k) => store.get<CardioEntry[]>(k))),
  ])
  for (const week of weeks) if (week) data.weeks[week.plan.weekId] = week
  for (const review of reviews) if (review) data.reviews[review.weekId] = review
  data.cardioLog = cardio.flatMap((entries) => entries ?? []).sort((a, b) => a.id.localeCompare(b.id))
  return data
}

/** Cardio entries grouped by `YYYY-MM`, the store partition. */
export function cardioByMonth(entries: CardioEntry[]): Record<string, CardioEntry[]> {
  const months: Record<string, CardioEntry[]> = {}
  for (const entry of entries) (months[entry.date.slice(0, 7)] ??= []).push(entry)
  return months
}

/**
 * Writes the documents that differ between `before` and `after`. Values are
 * compared by reference: the reducers return new objects only for what they
 * changed, so unchanged documents are never rewritten.
 */
export async function saveChanges(store: Store, before: AppData, after: AppData): Promise<void> {
  const writes: Promise<void>[] = []
  if (after.profile !== before.profile && after.profile) writes.push(store.set(KEYS.profile, after.profile))
  if (after.ladderState !== before.ladderState) writes.push(store.set(KEYS.ladderState, after.ladderState))
  if (after.elliptical !== before.elliptical && after.elliptical)
    writes.push(store.set(KEYS.elliptical, after.elliptical))
  if (after.reviewSummary !== before.reviewSummary && after.reviewSummary)
    writes.push(store.set(KEYS.reviewSummary, after.reviewSummary))
  if (after.proposals !== before.proposals) writes.push(store.set(KEYS.proposals, after.proposals))
  for (const [id, week] of Object.entries(after.weeks)) {
    if (before.weeks[id] !== week) writes.push(store.set(KEYS.week(id), week))
  }
  for (const [id, review] of Object.entries(after.reviews)) {
    if (before.reviews[id] !== review) writes.push(store.set(KEYS.review(id), review))
  }
  if (after.cardioLog !== before.cardioLog) {
    const previous = cardioByMonth(before.cardioLog)
    for (const [month, entries] of Object.entries(cardioByMonth(after.cardioLog))) {
      if (JSON.stringify(previous[month]) !== JSON.stringify(entries))
        writes.push(store.set(KEYS.cardio(month), entries))
    }
  }
  await Promise.all(writes)
}

/** Erases every PrepPhi document of the store (before an import). */
export async function clearData(store: Store): Promise<void> {
  const keys = await store.keys()
  const ours = keys.filter((k) => /^(profile|ladder-state|elliptical|review-|proposals|week-|cardio-)/.test(k))
  for (const key of ours) await store.delete(key)
}

// -- Export / import ---------------------------------------------------------

export type ExportFile = AppData & { app: 'prepphi'; exportedAt: string }

export function exportJson(data: AppData, now = new Date()): string {
  const file: ExportFile = { app: 'prepphi', exportedAt: now.toISOString(), ...data, schemaVersion: SCHEMA_VERSION }
  return JSON.stringify(file, null, 2)
}

export class ImportError extends Error {}

/** Parses an export file, migrating older schema versions. */
export function parseImport(text: string): AppData {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    throw new ImportError('Le fichier n’est pas un JSON valide.')
  }
  const file = raw as Partial<ExportFile>
  if (!file || typeof file !== 'object' || file.app !== 'prepphi') {
    throw new ImportError('Ce fichier n’est pas une sauvegarde PrepPhi.')
  }
  if (typeof file.schemaVersion !== 'number' || file.schemaVersion > SCHEMA_VERSION) {
    throw new ImportError('Cette sauvegarde vient d’une version plus récente de PrepPhi.')
  }
  // Version 1 is the first schema: nothing to migrate yet.
  const base = emptyData()
  return {
    schemaVersion: SCHEMA_VERSION,
    profile: file.profile ?? base.profile,
    ladderState: file.ladderState ?? base.ladderState,
    elliptical: file.elliptical ?? base.elliptical,
    weeks: file.weeks ?? base.weeks,
    cardioLog: file.cardioLog ?? base.cardioLog,
    reviews: file.reviews ?? base.reviews,
    reviewSummary: file.reviewSummary ?? base.reviewSummary,
    proposals: file.proposals ?? base.proposals,
  }
}
