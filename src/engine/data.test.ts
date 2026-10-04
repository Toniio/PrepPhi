import { describe, expect, it } from 'vitest'
import catalog from '../data/catalog.json'
import hdExercises from '../../data/hd-exercises.json'
import rulesJson from '../../data/rules.json'
import { getStep, LADDERS } from './data'
import { RULES } from './rules'

describe('data/ladders.json', () => {
  it('holds the 10 validated ladders', () => {
    expect(LADDERS).toHaveLength(10)
    expect(new Set(LADDERS.map((l) => l.id)).size).toBe(10)
  })

  it('numbers every ladder from 1 without gaps, with valid ranges', () => {
    for (const ladder of LADDERS) {
      ladder.steps.forEach((step, i) => {
        expect(step.level, `${ladder.id} step ${i}`).toBe(i + 1)
        expect(step.range[0]).toBeLessThan(step.range[1])
        expect(['reps', 's']).toContain(step.unit)
        if (step.format === 'cumulative') expect(step.pass).toBeDefined()
        else expect(step.sets).toBeGreaterThan(0)
      })
    }
  })

  it('points every step at an exercise that exists', () => {
    const ds = new Set(catalog.exercises.map((e) => e.id))
    const hd = new Set(hdExercises.exercises.map((e) => e.id))
    for (const ladder of LADDERS) {
      for (const step of ladder.steps) {
        const known = step.exercise.startsWith('ds:') ? ds.has(step.exercise) : hd.has(step.exercise)
        expect(known, `${ladder.id} L${step.level} ${step.exercise}`).toBe(true)
      }
    }
  })

  it('writes entry conditions on existing ladders and levels', () => {
    for (const ladder of LADDERS) {
      for (const condition of ladder.entry ?? []) {
        expect(() => getStep(condition.ladder, condition.level)).not.toThrow()
      }
    }
  })

  it('uses every hors-dataset sheet in a ladder', () => {
    const used = new Set(LADDERS.flatMap((l) => l.steps.map((s) => s.exercise)))
    for (const sheet of hdExercises.exercises) expect(used.has(sheet.id), sheet.id).toBe(true)
  })
})

describe('data/rules.json thresholds', () => {
  const text = JSON.stringify(rulesJson)

  it('progression', () => {
    expect(RULES.progression.nextStepSessions).toBe(rulesJson.progression.nextStep.consecutiveSessions)
    expect(RULES.progression.regressSessions).toBe(rulesJson.progression.regress.consecutiveSessions)
    expect(rulesJson.progression.withinStep.then).toContain(`+${RULES.progression.repStep} rep`)
    expect(rulesJson.progression.withinStep.then).toContain(`+${RULES.progression.secondsStep} s`)
  })

  it('deload', () => {
    const triggers = rulesJson.deload.triggersAnyOf.map((t) => t.rule).join(' | ')
    expect(triggers).toContain(`too-hard on >= ${RULES.deload.tooHardExercises} exercises`)
    expect(triggers).toContain(`>= ${RULES.deload.regressFamilies} families`)
    expect(triggers).toContain(`RPE >= ${RULES.deload.rpeThreshold}`)
    expect(triggers).toContain(`${RULES.deload.rpeSessions} sessions in a row`)
    expect(triggers).toContain(`>= ${RULES.deload.hrDriftBpm} bpm above the ${RULES.deload.hrWindowWeeks}-week average`)
    expect(rulesJson.deload.content).toContain(`${RULES.deload.deloadSets} sets instead of 3`)
  })

  it('pain', () => {
    expect(rulesJson.pain.recurring.when).toContain(`${RULES.pain.recurringWeeks} weeks in a row`)
  })

  it('travel', () => {
    expect(rulesJson.travel.detection.googleCalendar).toContain(`'${RULES.travel.keyword}'`)
    expect(RULES.travel.nomadMinutes).toEqual(rulesJson.travel.nomadSession.durationMin)
    expect(RULES.travel.freezeUpToDays).toBe(rulesJson.travel.untrainedFamily.freezeUpToDays)
  })

  it('elliptical', () => {
    const e = rulesJson.elliptical
    expect(e.duration.step).toBe(`+${RULES.elliptical.durationStepMin} min per week`)
    expect(e.duration.when).toContain(`RPE <= ${RULES.elliptical.rpeMax}`)
    expect(e.duration.until).toBe(RULES.elliptical.maxDurationMin)
    expect(e.resistance.step).toContain(`+${RULES.elliptical.resistanceStep} level`)
    const [lo, hi] = RULES.elliptical.intervalWindowMin
    expect(e.intervals.start).toBe(`after ${RULES.elliptical.intervalStableWeeks} stable weeks at ${lo}-${hi} min`)
    expect(e.intervals.example).toContain(`${RULES.elliptical.intervalStartReps} x (1 min hard / 2 min easy)`)
    expect(RULES.elliptical.hardSec).toBe(60)
    expect(RULES.elliptical.easySec).toBe(120)
    expect(e.intervals.progression).toContain(`up to ${RULES.elliptical.intervalMaxReps}`)
    expect(text).toContain(`RPE ${RULES.elliptical.endurancePrescribedRpe.join('-')}/10`)
  })

  it('coach tiers', () => {
    expect(rulesJson.coach.modelTier.weeklyPlan).toBe('complex')
    expect(rulesJson.coach.modelTier.conversation).toBe('default')
  })
})
