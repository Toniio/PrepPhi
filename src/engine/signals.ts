import { familyOf } from './data'
import { previousWeek, weekId } from './dates'
import type { ProgressionEvent } from './progression'
import { RULES } from './rules'
import type { CardioEntry, Family, IsoDate, SessionLog, WeekId } from './types'

// Weekly signals read at the Sunday review: semaine allégée triggers and
// recurring pain (data/rules.json "deload" and "pain").

export type DeloadTrigger = 'too-hard-count' | 'double-regress' | 'rpe-elliptical' | 'hr-drift'

export function inWeek(date: IsoDate, week: WeekId): boolean {
  return weekId(date) === week
}

/** too-hard on >= 3 exercises in the week, all families. */
export function tooHardExercises(logs: SessionLog[], week: WeekId): string[] {
  const ladders = new Set<string>()
  for (const log of logs) {
    if (!inWeek(log.date, week)) continue
    for (const result of log.results) if (result.feeling === 'too-hard') ladders.add(result.ladderId)
  }
  return [...ladders]
}

/** Families where a regression was triggered this week. */
export function regressedFamilies(events: ProgressionEvent[]): Family[] {
  const families = new Set<Family>()
  for (const event of events) if (event.type === 'regressed') families.add(familyOf(event.ladderId))
  return [...families]
}

export function isElliptical(entry: CardioEntry): boolean {
  return entry.type.toLowerCase().includes('elliptical')
}

/** RPE >= 7 on two endurance sessions in a row, the second one this week. */
export function rpeStreak(cardio: CardioEntry[], week: WeekId): boolean {
  const sessions = cardio.filter(isElliptical).sort((a, b) => a.id.localeCompare(b.id))
  for (let i = 1; i < sessions.length; i += 1) {
    const [a, b] = [sessions[i - 1], sessions[i]]
    if (!inWeek(b.date, week)) continue
    if ((a.rpe ?? 0) >= RULES.deload.rpeThreshold && (b.rpe ?? 0) >= RULES.deload.rpeThreshold) return true
  }
  return false
}

const SAME_DURATION_MIN = 2

/**
 * Average HR this week >= 8 bpm above the 4-week average, comparing only
 * sessions of equal duration (within 2 min) and equal resistance.
 */
export function hrDrift(cardio: CardioEntry[], week: WeekId): boolean {
  const earlier = new Set(Array.from({ length: RULES.deload.hrWindowWeeks }, (_, i) => previousWeek(week, i + 1)))
  const sessions = cardio.filter((e) => isElliptical(e) && e.avgHr !== null)
  for (const current of sessions.filter((e) => inWeek(e.date, week))) {
    const comparable = sessions.filter(
      (e) =>
        earlier.has(weekId(e.date)) &&
        e.resistance === current.resistance &&
        Math.abs(e.durationMin - current.durationMin) <= SAME_DURATION_MIN,
    )
    if (comparable.length === 0) continue
    const average = comparable.reduce((sum, e) => sum + (e.avgHr ?? 0), 0) / comparable.length
    if ((current.avgHr ?? 0) - average >= RULES.deload.hrDriftBpm) return true
  }
  return false
}

export function deloadTriggers(input: {
  week: WeekId
  logs: SessionLog[]
  events: ProgressionEvent[]
  cardio: CardioEntry[]
}): DeloadTrigger[] {
  const triggers: DeloadTrigger[] = []
  if (tooHardExercises(input.logs, input.week).length >= RULES.deload.tooHardExercises) triggers.push('too-hard-count')
  if (regressedFamilies(input.events).length >= RULES.deload.regressFamilies) triggers.push('double-regress')
  if (rpeStreak(input.cardio, input.week)) triggers.push('rpe-elliptical')
  if (hrDrift(input.cardio, input.week)) triggers.push('hr-drift')
  return triggers
}

/** Families with a pain flag in the given week. */
export function painFamilies(logs: SessionLog[], week: WeekId): Family[] {
  const families = new Set<Family>()
  for (const log of logs) {
    if (!inWeek(log.date, week)) continue
    for (const result of log.results) if (result.pain) families.add(familyOf(result.ladderId))
  }
  return [...families]
}

/** Same family flagged 2 weeks in a row: recommend a health professional, pause it. */
export function recurringPain(logs: SessionLog[], week: WeekId): Family[] {
  const now = new Set(painFamilies(logs, week))
  let streak = [...now]
  for (let back = 1; back < RULES.pain.recurringWeeks; back += 1) {
    const before = new Set(painFamilies(logs, previousWeek(week, back)))
    streak = streak.filter((family) => before.has(family))
  }
  return streak
}
