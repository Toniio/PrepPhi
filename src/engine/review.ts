import { getLadder, getStep } from './data'
import { weekDates } from './dates'
import type { ProgressionEvent } from './progression'
import { regularity } from './schedule'
import { deloadTriggers, painFamilies, recurringPain, type DeloadTrigger } from './signals'
import { staleLadders } from './travel'
import type { CardioEntry, ExerciseResult, Family, LadderState, SessionLog, WeekPlan } from './types'

// What the Sunday review is about: the facts the rules computed, which the
// coach turns into a summary and proposals, and the screen lists.

export type LadderWeek = {
  ladderId: string
  nameFr: string
  level: number
  stepNameFr: string
  targets: number[]
  unit: 'reps' | 's'
  results: Pick<ExerciseResult, 'values' | 'feeling' | 'pain'>[]
  frozen: boolean
  paused: boolean
  stepUpProposed: boolean
}

export type ReviewFacts = {
  weekId: string
  regularity: { done: number; planned: number; ratio: number | null }
  sessions: { date: string; title: string; kind: string; status: string }[]
  ladders: LadderWeek[]
  stepUps: { ladderId: string; from: number; to: number }[]
  regressions: { ladderId: string; from: number; to: number }[]
  painDrops: { ladderId: string; from: number; to: number }[]
  mastered: string[]
  deloadTriggers: DeloadTrigger[]
  painFamilies: Family[]
  recurringPain: Family[]
  stale: { ladderId: string; days: number }[]
}

export function reviewFacts(input: {
  plan: WeekPlan
  logs: SessionLog[]
  events: ProgressionEvent[]
  states: Record<string, LadderState>
  cardio: CardioEntry[]
}): ReviewFacts {
  const { plan, logs, events, states } = input
  const week = plan.weekId
  const sunday = weekDates(week)[6]
  const weekLogs = logs.filter((log) => weekDates(week).includes(log.date))

  const ladders: LadderWeek[] = Object.values(states)
    .filter((s) => s.unlocked)
    .map((s) => {
      const step = getStep(s.ladderId, s.level)
      return {
        ladderId: s.ladderId,
        nameFr: getLadder(s.ladderId).nameFr,
        level: s.level,
        stepNameFr: step.nameFr,
        targets: s.targets,
        unit: step.unit,
        results: weekLogs.flatMap((log) =>
          log.results
            .filter((r) => r.ladderId === s.ladderId)
            .map(({ values, feeling, pain }) => ({ values, feeling, pain })),
        ),
        frozen: s.frozen,
        paused: s.paused,
        stepUpProposed: s.stepUpProposed,
      }
    })

  const of = <T extends ProgressionEvent['type']>(type: T) =>
    events.filter((e): e is Extract<ProgressionEvent, { type: T }> => e.type === type)

  return {
    weekId: week,
    regularity: regularity(plan),
    sessions: plan.sessions.map(({ date, title, kind, status }) => ({ date, title, kind, status })),
    ladders,
    stepUps: Object.values(states)
      .filter((s) => s.stepUpProposed)
      .map((s) => ({ ladderId: s.ladderId, from: s.level, to: s.level + 1 })),
    regressions: of('regressed').map(({ ladderId, from, to }) => ({ ladderId, from, to })),
    painDrops: of('pain-drop').map(({ ladderId, from, to }) => ({ ladderId, from, to })),
    mastered: of('skill-mastered').map((e) => e.ladderId),
    deloadTriggers: deloadTriggers({ week, logs, events, cardio: input.cardio }),
    painFamilies: painFamilies(logs, week),
    recurringPain: recurringPain(logs, week),
    stale: staleLadders(Object.values(states), sunday),
  }
}
