import { addDays, weekDates } from './dates'
import { isTravelDay, type Trip } from './travel'
import type { IsoDate, PlannedSession, WeekPlan } from './types'

// Missed sessions (data/rules.json "missedSession") and regularity.

const STRENGTH = new Set(['calisthenics', 'nomad', 'park'])

function busy(plan: WeekPlan, day: IsoDate, except: string): PlannedSession[] {
  return plan.sessions.filter((s) => s.id !== except && s.date === day && s.status !== 'missed' && s.status !== 'abandoned')
}

export type MissedOutcome = { type: 'moved'; to: IsoDate; nomad: boolean } | { type: 'abandoned' }

/**
 * Slides a missed session to the next free day of the same week, from
 * `today` on, never next to another calisthenics day; on a travel day only
 * the nomad version. No slot before Sunday: abandoned, flagged at review,
 * no effect on the steps. A park session is optional: never moved.
 */
export function rescheduleMissed(
  plan: WeekPlan,
  sessionId: string,
  today: IsoDate,
  trips: Trip[],
  nomadVersion: (session: PlannedSession, date: IsoDate) => PlannedSession,
): { plan: WeekPlan; outcome: MissedOutcome } {
  const missed = plan.sessions.find((s) => s.id === sessionId)
  if (!missed) throw new Error(`No session ${sessionId}`)
  const strength = STRENGTH.has(missed.kind)
  const mark = (status: PlannedSession['status']) =>
    plan.sessions.map((s) => (s.id === sessionId ? { ...s, status } : s))

  if (missed.kind === 'park') return { plan: { ...plan, sessions: mark('missed') }, outcome: { type: 'abandoned' } }

  const candidates = weekDates(plan.weekId).filter((d) => d > missed.date && d >= today)
  for (const day of candidates) {
    const sameDay = busy(plan, day, sessionId)
    if (sameDay.some((s) => (strength ? STRENGTH.has(s.kind) : s.kind === missed.kind))) continue
    if (strength) {
      const neighbours = [addDays(day, -1), addDays(day, 1)].flatMap((d) => busy(plan, d, sessionId))
      if (neighbours.some((s) => STRENGTH.has(s.kind))) continue
    }
    const travel = isTravelDay(day, trips)
    if (travel && missed.kind === 'elliptical') continue
    const moved: PlannedSession =
      travel && strength
        ? nomadVersion(missed, day)
        : { ...missed, id: `${day}-${missed.kind}`, date: day }
    const sessions = [...mark('missed'), { ...moved, status: 'planned' as const, movedFrom: missed.date }].sort(
      (a, b) => a.date.localeCompare(b.date) || a.kind.localeCompare(b.kind),
    )
    return { plan: { ...plan, sessions }, outcome: { type: 'moved', to: day, nomad: travel && strength } }
  }
  return { plan: { ...plan, sessions: mark('abandoned') }, outcome: { type: 'abandoned' } }
}

/**
 * Sessions done / sessions planned, nomad and park included; a park session
 * counts only if done. A session that was moved counts once, where it went.
 */
export function regularity(plan: WeekPlan): { done: number; planned: number; ratio: number | null } {
  const counted = plan.sessions.filter((s) => s.status !== 'missed' && (s.kind !== 'park' || s.status === 'done'))
  const done = counted.filter((s) => s.status === 'done').length
  const planned = counted.length
  return { done, planned, ratio: planned ? done / planned : null }
}
