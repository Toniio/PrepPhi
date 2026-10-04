import type { CalendarClient, CalendarEvent, Store } from '../types'

const KEY = 'dev-calendar'

function isoDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

/** A two-day trip to Paris starting on the Tuesday of next week. */
export function seedEvents(today = new Date()): CalendarEvent[] {
  const daysToNextMonday = ((8 - today.getDay()) % 7) || 7
  const tuesday = addDays(today, daysToNextMonday + 1)
  return [
    {
      id: 'dev-paris',
      title: 'Paris',
      start: isoDate(tuesday),
      end: isoDate(addDays(tuesday, 2)),
      allDay: true,
    },
  ]
}

// ISO strings compare in time order, and a date-time sorts after its own date.
function overlaps(event: CalendarEvent, from: string, to: string): boolean {
  return event.start < to && event.end > from
}

/**
 * A fake calendar kept in the development store: it starts with a trip to
 * Paris so the travel detection has something to find, and keeps the
 * sessions "added to the calendar".
 */
export function createDevCalendar(store: Store): CalendarClient {
  async function load(): Promise<CalendarEvent[]> {
    const events = await store.get<CalendarEvent[]>(KEY)
    if (events) return events
    const seeded = seedEvents()
    await store.set(KEY, seeded)
    return seeded
  }

  return {
    available: true,

    async listEvents(from, to) {
      return (await load()).filter((event) => overlaps(event, from, to))
    },

    async createEvents(events) {
      const current = await load()
      const added = events.map((event, i) => ({
        id: `dev-${Date.now()}-${i}`,
        title: event.title,
        start: event.start,
        end: event.end,
        allDay: false,
      }))
      await store.set(KEY, [...current, ...added])
      return { created: added.length }
    },
  }
}
