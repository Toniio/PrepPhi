import { addDays, daysBetween } from './dates'
import { RULES } from './rules'
import type { IsoDate, LadderState } from './types'

// Trips to Paris (data/rules.json "travel").

export type CalendarDay = { title: string; start: string; end: string; allDay: boolean }
export type Trip = { from: IsoDate; to: IsoDate }

/**
 * All-day events whose title contains "Paris", merged when consecutive.
 * `to` is the last day of the trip (inclusive). Never switches the plan by
 * itself: the trips are proposed for confirmation.
 */
export function detectTrips(events: CalendarDay[], keyword: string = RULES.travel.keyword): Trip[] {
  const days = new Set<IsoDate>()
  for (const event of events) {
    if (!event.allDay || !event.title.toLowerCase().includes(keyword.toLowerCase())) continue
    const start = event.start.slice(0, 10)
    const end = event.end.slice(0, 10)
    for (let day = start; day < end; day = addDays(day, 1)) days.add(day)
  }
  const sorted = [...days].sort()
  const trips: Trip[] = []
  for (const day of sorted) {
    const last = trips.at(-1)
    if (last && addDays(last.to, 1) === day) last.to = day
    else trips.push({ from: day, to: day })
  }
  return trips
}

export function isTravelDay(day: IsoDate, trips: Trip[]): boolean {
  return trips.some((trip) => day >= trip.from && day <= trip.to)
}

/**
 * Ladders untrained for a while. Up to 10 days the ladder simply waits
 * (frozen, no regression); beyond, the coach proposes a re-entry week at
 * the previous step.
 */
export function staleLadders(states: LadderState[], day: IsoDate): { ladderId: string; days: number }[] {
  return states
    .filter((s) => s.unlocked && !s.paused && s.lastTrained !== null)
    .map((s) => ({ ladderId: s.ladderId, days: daysBetween(s.lastTrained!, day) }))
    .filter((s) => s.days > RULES.travel.freezeUpToDays)
}
