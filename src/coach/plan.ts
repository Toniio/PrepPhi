import { accessoryPool, getExercise } from '@/catalog'
import { addDays, isTravelDay, weekDates, weekday, type Profile, type WeekPlan } from '@/engine'
import type { WeeklyPlanReply } from './prompts'

// The coach's answer is untrusted data: each change is checked against the
// rules before it reaches the plan, and anything invalid is dropped.

const STRENGTH = new Set(['calisthenics', 'nomad', 'park'])
const MAX_ACCESSORIES = 2

export type AppliedPlan = { plan: WeekPlan; dropped: number }

export function applyCoachReply(plan: WeekPlan, reply: Partial<WeeklyPlanReply>, profile: Profile): AppliedPlan {
  let dropped = 0
  const sessions = plan.sessions.map((s) => ({ ...s }))
  // The coach names sessions by their id before any move.
  const byId = new Map(sessions.map((s) => [s.id, s]))
  const dates = new Set(weekDates(plan.weekId))
  const trips = plan.trips.filter((t) => t.confirmed)

  for (const move of Array.isArray(reply.moves) ? reply.moves : []) {
    const session = byId.get(String(move?.sessionId))
    const to = String(move?.toDate ?? '')
    const strength = session && STRENGTH.has(session.kind)
    const neighbours = strength
      ? sessions.filter(
          (s) =>
            s.id !== session.id &&
            STRENGTH.has(s.kind) &&
            (s.date === addDays(to, -1) || s.date === addDays(to, 1) || s.date === to),
        )
      : []
    const ok =
      session &&
      session.status === 'planned' &&
      dates.has(to) &&
      profile.availableDays.includes(weekday(to)) &&
      neighbours.length === 0 &&
      (session.kind === 'nomad') === isTravelDay(to, trips)
    if (!ok) {
      dropped += 1
      continue
    }
    session.date = to
    session.id = `${to}-${session.kind}`
  }

  const pool = new Set(
    Object.values(accessoryPool())
      .flat()
      .map((a) => a.id),
  )
  for (const accessory of Array.isArray(reply.accessories) ? reply.accessories : []) {
    const session = byId.get(String(accessory?.sessionId))
    const unit = accessory?.unit === 's' ? 's' : 'reps'
    const sets = Number(accessory?.sets)
    const target = Number(accessory?.target)
    const range = unit === 's' ? [15, 90] : [5, 30]
    const ok =
      session &&
      session.kind === 'calisthenics' &&
      pool.has(String(accessory?.exercise)) &&
      (session.accessories?.length ?? 0) < MAX_ACCESSORIES &&
      sets >= 1 &&
      sets <= 4 &&
      target >= range[0] &&
      target <= range[1]
    if (!ok) {
      dropped += 1
      continue
    }
    const exercise = String(accessory.exercise)
    session.accessories = [
      ...(session.accessories ?? []),
      { exercise, nameFr: getExercise(exercise).nameFr, sets, target, unit },
    ]
  }

  for (const note of Array.isArray(reply.notes) ? reply.notes : []) {
    const session = byId.get(String(note?.sessionId))
    const text = typeof note?.note === 'string' ? note.note.trim().slice(0, 160) : ''
    if (!session || !text) {
      dropped += 1
      continue
    }
    session.coachNote = text
  }

  sessions.sort((a, b) => a.date.localeCompare(b.date) || a.kind.localeCompare(b.kind))
  return { plan: { ...plan, sessions }, dropped }
}
