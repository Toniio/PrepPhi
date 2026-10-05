import { describe, expect, it } from 'vitest'
import { getExercise } from '@/catalog'
import {
  getStep,
  previousWeek,
  regularity,
  reviewFacts,
  weekDates,
  weekday,
  weekId as weekOf,
  type IsoDate,
  type PlannedSession,
} from '@/engine'
import { exportJson, parseImport } from '@/model/repository'
import { buildDemoData } from '.'

// A Monday, a Thursday and a Sunday: the week parity and the day change what the planner does.
const DAYS: IsoDate[] = ['2026-10-05', '2026-10-08', '2026-10-11', '2026-10-14', '2026-12-31', '2027-01-03']

const animated = (id: string) => getExercise(id).mediaUrl !== null
const exercisesOf = (s: PlannedSession) => [
  ...s.exercises.map((e) => e.exercise),
  ...(s.accessories ?? []).map((a) => a.exercise),
]

describe('buildDemoData', () => {
  for (const today of DAYS) {
    describe(today, () => {
      const data = buildDemoData(today)
      const current = weekOf(today)
      // On Sunday, the review day, the history runs up to the current week.
      const sunday = weekday(today) === 7
      const last = sunday ? current : previousWeek(current)
      const history = [2, 1, 0].map((n) => previousWeek(last, n))

      it('holds three complete weeks of history and the current week', () => {
        expect(data.profile?.demo).toBe(true)
        expect(Object.keys(data.weeks).sort()).toEqual([...new Set([...history, current])])
        for (const id of history) {
          const { plan, logs } = data.weeks[id]
          expect(plan.sessions.length).toBeGreaterThanOrEqual(5)
          expect(logs.length).toBeGreaterThanOrEqual(sunday && id === last ? 2 : 3)
          // Only today's sessions can still be to do, on the review day.
          expect(plan.sessions.filter((s) => s.status === 'planned').every((s) => sunday && s.date === today)).toBe(
            true,
          )
        }
      })

      it('plans, in every week, only exercises with an animation', () => {
        for (const week of Object.values(data.weeks)) {
          for (const session of week.plan.sessions) {
            for (const id of exercisesOf(session)) expect(animated(id), `${session.id} ${id}`).toBe(true)
          }
          for (const log of week.logs) {
            for (const r of log.results) expect(animated(getStep(r.ladderId, r.level).exercise)).toBe(true)
          }
        }
      })

      it('has reviews for the first two weeks and the last one to do', () => {
        expect(data.reviews[history[0]].planned).toBe(true)
        expect(data.reviews[history[1]].planned).toBe(true)
        expect(data.reviews[history[2]].planned).toBe(false)
        expect(data.reviews[history[2]].messages).toHaveLength(2)
        expect(data.reviewSummary?.throughWeek).toBe(history[1])
        expect(data.proposals.map((p) => p.status)).toEqual(['accepted', 'pending'])
      })

      it('puts a step-up to decide in the last review', () => {
        const week = data.weeks[history[2]]
        const facts = reviewFacts({
          plan: week.plan,
          logs: week.logs,
          events: week.events.map((e) => e.event),
          states: data.ladderState,
          cardio: data.cardioLog,
        })
        expect(facts.stepUps.length).toBeGreaterThan(0)
        expect(facts.deloadTriggers).toEqual([])
      })

      it('tells the travel, the moved session and the abandoned one', () => {
        const [first, second, third] = history.map((id) => data.weeks[id].plan)
        expect(first.trips).toEqual([])
        expect(second.trips).toHaveLength(1)
        expect(second.sessions.some((s) => s.kind === 'nomad' && s.status === 'done')).toBe(true)
        expect(second.sessions.some((s) => s.status === 'abandoned')).toBe(true)
        expect(third.sessions.some((s) => s.movedFrom !== undefined)).toBe(true)
        expect(regularity(first).ratio).toBe(1)
        expect(regularity(second).ratio).toBeCloseTo(0.8)
        // The moved session lands on Sunday: done, or still to do when Sunday is today.
        expect(regularity(third).ratio).toBeCloseTo(sunday ? 0.8 : 1)
      })

      it('keeps the elliptical in its zone and steps it up', () => {
        const elliptical = data.cardioLog.filter((e) => e.type === 'Elliptical')
        expect(elliptical).toHaveLength(5)
        for (const e of elliptical) {
          expect(e.avgHr).toBeGreaterThanOrEqual(136)
          expect(e.avgHr).toBeLessThanOrEqual(149)
          expect(e.rpe).toBe(4)
          expect(e.resistance).toBe(1)
        }
        expect(elliptical.map((e) => e.durationMin)).toEqual([30, 30, 35, 40, 40])
        expect(data.elliptical?.durationMin).toBe(40)
        expect(new Set(data.cardioLog.map((e) => e.id)).size).toBe(data.cardioLog.length)
        expect(data.cardioLog.every((e) => e.date >= weekDates(history[0])[0] && e.date < today)).toBe(true)
      })

      it('plans the current week from today, with no day gone by', () => {
        if (sunday) return
        const plan = data.weeks[current].plan
        expect(plan.sessions.every((s) => s.date >= today && s.status === 'planned')).toBe(true)
        expect(plan.sessions.length).toBeGreaterThan(0)
      })

      it('round-trips through the JSON export', () => {
        expect(parseImport(exportJson(data))).toEqual(data)
      })
    })
  }

  it('is deterministic', () => {
    expect(buildDemoData('2026-10-07')).toEqual(buildDemoData('2026-10-07'))
  })
})
