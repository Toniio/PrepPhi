import type { IsoDate, WeekId } from './types'

// Calendar arithmetic on local dates, without time zones: an IsoDate is a
// day, parsed at noon UTC so no offset can move it to another day.

export function parseDate(date: IsoDate): Date {
  return new Date(`${date}T12:00:00Z`)
}

export function formatDate(date: Date): IsoDate {
  return date.toISOString().slice(0, 10)
}

/** Today in the local time zone. */
export function today(now = new Date()): IsoDate {
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function addDays(date: IsoDate, days: number): IsoDate {
  const d = parseDate(date)
  d.setUTCDate(d.getUTCDate() + days)
  return formatDate(d)
}

export function daysBetween(from: IsoDate, to: IsoDate): number {
  return Math.round((parseDate(to).getTime() - parseDate(from).getTime()) / 86_400_000)
}

/** 1 = Monday … 7 = Sunday. */
export function weekday(date: IsoDate): number {
  const day = parseDate(date).getUTCDay()
  return day === 0 ? 7 : day
}

export function mondayOf(date: IsoDate): IsoDate {
  return addDays(date, 1 - weekday(date))
}

/** ISO 8601 week: the week that holds the year's first Thursday is week 1. */
export function weekId(date: IsoDate): WeekId {
  const thursday = addDays(date, 4 - weekday(date))
  const year = Number(thursday.slice(0, 4))
  const week = Math.floor(daysBetween(`${year}-01-01`, thursday) / 7) + 1
  return `${year}-W${String(week).padStart(2, '0')}`
}

export function weekStart(id: WeekId): IsoDate {
  const [year, week] = id.split('-W').map(Number)
  // 4 January is always in week 1.
  const week1Monday = mondayOf(`${year}-01-04`)
  return addDays(week1Monday, (week - 1) * 7)
}

/** The seven dates of a week, Monday first. */
export function weekDates(id: WeekId): IsoDate[] {
  const monday = weekStart(id)
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i))
}

export function previousWeek(id: WeekId, count = 1): WeekId {
  return weekId(addDays(weekStart(id), -7 * count))
}

export function nextWeek(id: WeekId): WeekId {
  return weekId(addDays(weekStart(id), 7))
}
