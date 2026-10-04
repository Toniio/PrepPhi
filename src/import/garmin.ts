import type { CardioEntry } from '@/engine'

// The Garmin Connect "Activités" CSV export: one row per activity, every
// activity type mixed, several weeks per file (CLAUDE.md, "Import Garmin").

/** Types kept, and how they are stored. Everything else is counted and ignored. */
export const KEPT_TYPES: Record<string, string> = {
  elliptical: 'Elliptical',
  'strength training': 'Strength Training',
  hiit: 'HIIT',
}

/** Splits CSV text into rows of fields, honoring quotes and doubled quotes. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false
  const input = text.replace(/^﻿/, '')
  for (let i = 0; i < input.length; i += 1) {
    const c = input[i]
    if (quoted) {
      if (c === '"' && input[i + 1] === '"') {
        field += '"'
        i += 1
      } else if (c === '"') quoted = false
      else field += c
    } else if (c === '"') quoted = true
    else if (c === ',') {
      row.push(field)
      field = ''
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && input[i + 1] === '\n') i += 1
      row.push(field)
      if (row.some((f) => f.trim() !== '')) rows.push(row)
      row = []
      field = ''
    } else field += c
  }
  row.push(field)
  if (row.some((f) => f.trim() !== '')) rows.push(row)
  return rows
}

/** `--` is empty, `2,992` has a thousands separator, `'-4` carries a quote before the sign. */
export function parseNumber(raw: string | undefined): number | null {
  if (raw === undefined) return null
  const value = raw.trim().replace(/^'/, '').replace(/,/g, '')
  if (value === '' || value === '--') return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

/** `00:35:12`, `35:12` or `1:05:00` to minutes, rounded. */
export function parseDuration(raw: string | undefined): number | null {
  if (!raw || raw.trim() === '--') return null
  const parts = raw.trim().split(':').map(Number)
  if (parts.some((p) => !Number.isFinite(p))) return null
  const [h, m, s] = parts.length === 3 ? parts : [0, parts[0], parts[1] ?? 0]
  return Math.round(h * 60 + m + s / 60)
}

export type GarminImport = {
  entries: CardioEntry[]
  /** Rows of a type PrepPhi does not keep (Yoga, Breathwork…), by type. */
  ignored: Record<string, number>
  /** Rows that could not be read (no date). */
  invalid: number
}

export class GarminFormatError extends Error {}

export function parseGarminCsv(text: string): GarminImport {
  const [header, ...rows] = parseCsv(text)
  if (!header) throw new GarminFormatError('Le fichier est vide.')
  const col = (name: string) => header.findIndex((h) => h.trim().toLowerCase() === name.toLowerCase())
  const type = col('Activity Type')
  const date = col('Date')
  if (type < 0 || date < 0) {
    throw new GarminFormatError(
      'Le fichier ne contient pas les colonnes « Activity Type » et « Date ». Exporte le CSV « Activités » depuis Garmin Connect.',
    )
  }
  const time = col('Time')
  const avgHr = col('Avg HR')
  const maxHr = col('Max HR')
  const calories = col('Calories')

  const entries: CardioEntry[] = []
  const ignored: Record<string, number> = {}
  let invalid = 0
  for (const row of rows) {
    const rawType = (row[type] ?? '').trim()
    const kept = KEPT_TYPES[rawType.toLowerCase()]
    if (!kept) {
      if (rawType) ignored[rawType] = (ignored[rawType] ?? 0) + 1
      continue
    }
    const when = (row[date] ?? '').trim()
    if (!/^\d{4}-\d{2}-\d{2}/.test(when)) {
      invalid += 1
      continue
    }
    entries.push({
      id: when,
      date: when.slice(0, 10),
      type: kept,
      durationMin: parseDuration(row[time]) ?? 0,
      avgHr: parseNumber(row[avgHr]),
      maxHr: parseNumber(row[maxHr]),
      calories: parseNumber(row[calories]),
      resistance: null,
      rpe: null,
    })
  }
  return { entries, ignored, invalid }
}

/**
 * Merges an import into the cardio log. An export holds several weeks, so
 * activities already known (same `Date`) are skipped. A Garmin elliptical
 * session takes the resistance and effort typed by hand that day, and the
 * manual entry goes away.
 */
export function mergeCardio(
  log: CardioEntry[],
  incoming: CardioEntry[],
): { log: CardioEntry[]; added: number; duplicates: number } {
  const known = new Set(log.map((e) => e.id))
  let next = [...log]
  let added = 0
  let duplicates = 0
  for (const entry of incoming) {
    if (known.has(entry.id)) {
      duplicates += 1
      continue
    }
    const manual = next.find((e) => e.id === `${entry.date} manual` && e.type === entry.type)
    const merged = manual
      ? { ...entry, resistance: manual.resistance, rpe: manual.rpe, durationMin: entry.durationMin || manual.durationMin }
      : entry
    if (manual) next = next.filter((e) => e !== manual)
    next.push(merged)
    known.add(entry.id)
    added += 1
  }
  next.sort((a, b) => a.id.localeCompare(b.id))
  return { log: next, added, duplicates }
}
