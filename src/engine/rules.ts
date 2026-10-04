import rulesJson from '../../data/rules.json'

/**
 * The numeric thresholds of data/rules.json, typed. Most rules are written
 * as sentences in the JSON (the validated doc's wording); rules.test.ts
 * checks that every number here appears in the matching rule, so the two
 * cannot drift. Changing a threshold needs Anthony's approval.
 */
export const RULES = {
  progression: {
    nextStepSessions: rulesJson.progression.nextStep.consecutiveSessions,
    regressSessions: rulesJson.progression.regress.consecutiveSessions,
    repStep: 1,
    secondsStep: 5,
  },
  deload: {
    tooHardExercises: 3,
    regressFamilies: 2,
    rpeThreshold: 7,
    rpeSessions: 2,
    hrDriftBpm: 8,
    hrWindowWeeks: 4,
    deloadSets: 2,
  },
  pain: {
    recurringWeeks: 2,
  },
  travel: {
    keyword: 'Paris',
    nomadMinutes: rulesJson.travel.nomadSession.durationMin as [number, number],
    freezeUpToDays: rulesJson.travel.untrainedFamily.freezeUpToDays,
  },
  elliptical: {
    durationStepMin: 5,
    rpeMax: 5,
    maxDurationMin: rulesJson.elliptical.duration.until,
    resistanceStep: 1,
    intervalStableWeeks: 3,
    intervalWindowMin: [40, 45] as [number, number],
    intervalStartReps: 6,
    intervalMaxReps: 10,
    hardSec: 60,
    easySec: 120,
    endurancePrescribedRpe: [3, 4] as [number, number],
  },
} as const

export const RULES_VERSION: string = rulesJson.version

export const COACH_TIERS = rulesJson.coach.modelTier
