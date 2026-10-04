import type { IsoDate, WeekPlan } from '@/engine'

/**
 * When the planned week has already started (a review done late), the days
 * gone by keep what happened: only the sessions from today on are replaced.
 */
export function mergePlan(existing: WeekPlan | undefined, fresh: WeekPlan, today: IsoDate): WeekPlan {
  if (!existing) return fresh
  const kept = existing.sessions.filter((s) => s.date < today || s.status !== 'planned')
  const added = fresh.sessions.filter((s) => s.date >= today && !kept.some((k) => k.id === s.id))
  return {
    ...fresh,
    sessions: [...kept, ...added].sort((a, b) => a.date.localeCompare(b.date) || a.kind.localeCompare(b.kind)),
  }
}
