import { accessoryPool, getExercise } from '@/catalog'
import { getLadder, getStep, previousWeek, weekDates, type ReviewFacts, type WeekId } from '@/engine'
import type { AppData } from '@/model/schema'

// What the coach reads (CLAUDE.md, "Coach"): the last 4 weeks in detail, the
// cumulative summary stored at each review, the ladders and an accessory
// pool per muscle group. Never the whole catalog.

export const DETAIL_WEEKS = 4

function weekDetail(data: AppData, weekId: WeekId) {
  const week = data.weeks[weekId]
  const dates = new Set(weekDates(weekId))
  return {
    week: weekId,
    deload: week?.plan.deload ?? false,
    trips: week?.plan.trips.filter((t) => t.confirmed).map((t) => `${t.from} → ${t.to}`) ?? [],
    sessions: week?.plan.sessions.map((s) => ({ date: s.date, title: s.title, kind: s.kind, status: s.status })) ?? [],
    results:
      week?.logs.flatMap((log) =>
        log.results.map((r) => ({
          date: log.date,
          ladder: getLadder(r.ladderId).nameFr,
          level: r.level,
          values: r.values,
          feeling: r.feeling,
          pain: r.pain,
        })),
      ) ?? [],
    elliptical: data.cardioLog
      .filter((e) => dates.has(e.date) && e.type.toLowerCase().includes('elliptical'))
      .map(({ date, durationMin, avgHr, resistance, rpe }) => ({ date, durationMin, avgHr, resistance, rpe })),
  }
}

export function buildContext(data: AppData, weekId: WeekId) {
  const weeks = Array.from({ length: DETAIL_WEEKS }, (_, i) => previousWeek(weekId, DETAIL_WEEKS - 1 - i))
  return {
    profile: data.profile && {
      sessionsPerWeek: { calisthenics: data.profile.calisthenicsPerWeek, elliptical: data.profile.ellipticalPerWeek },
      availableDays: data.profile.availableDays,
      parkSessions: data.profile.parkSessions,
    },
    priorities:
      'régularité > force et skills > endurance > recomposition. Skill 1 : handstand. Skill 2 : muscle-up, au parc seulement.',
    ladders: Object.values(data.ladderState).map((s) => {
      const ladder = getLadder(s.ladderId)
      const step = getStep(s.ladderId, s.level)
      return {
        id: s.ladderId,
        name: ladder.nameFr,
        unlocked: s.unlocked,
        level: s.level,
        of: ladder.steps.length,
        step: step.nameFr,
        range: step.range,
        unit: step.unit,
        targets: s.targets,
        frozen: s.frozen,
        paused: s.paused,
        stepUpProposed: s.stepUpProposed,
      }
    }),
    elliptical: data.elliptical,
    cumulativeSummary: data.reviewSummary?.text ?? null,
    weeks: weeks.map((id) => weekDetail(data, id)),
    accessoryPool: accessoryPool(),
  }
}

export type CoachContext = ReturnType<typeof buildContext>

/** Plain-French names of the facts, for the prompt and the dev coach. */
export function describeFacts(facts: ReviewFacts): string[] {
  const lines: string[] = []
  const { done, planned } = facts.regularity
  lines.push(`${done} séance${done > 1 ? 's' : ''} sur ${planned} cette semaine.`)
  for (const s of facts.stepUps) lines.push(`${getLadder(s.ladderId).nameFr} : palier ${s.to} proposé.`)
  for (const r of facts.regressions) lines.push(`${getLadder(r.ladderId).nameFr} : retour au palier ${r.to}.`)
  for (const p of facts.painDrops)
    lines.push(`${getLadder(p.ladderId).nameFr} : douleur signalée, palier ${p.to} et progression gelée.`)
  for (const m of facts.mastered) lines.push(`${getLadder(m).nameFr} : acquis.`)
  if (facts.deloadTriggers.length) lines.push(`Signaux de semaine allégée : ${facts.deloadTriggers.join(', ')}.`)
  if (facts.recurringPain.length) lines.push(`Douleur deux semaines de suite : ${facts.recurringPain.join(', ')}.`)
  for (const s of facts.stale) lines.push(`${getLadder(s.ladderId).nameFr} : pas travaillé depuis ${s.days} jours.`)
  return lines
}

export function exerciseName(id: string): string {
  return getExercise(id).nameFr
}
