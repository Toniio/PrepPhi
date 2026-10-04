// Domain types of the rules engine. Pure data: no React, no runtime.

export type Feeling = 'too-easy' | 'right' | 'too-hard'
export type Unit = 'reps' | 's'
export type Context = 'home' | 'travel' | 'park'
export type Family = 'pull' | 'push' | 'legs' | 'core' | 'skill'

/** `YYYY-MM-DD`, local calendar date. */
export type IsoDate = string
/** `YYYY-Www`, ISO 8601 week (weeks run Monday to Sunday). */
export type WeekId = string

// -- Ladders (data/ladders.json) -------------------------------------------

export type EntryCondition = {
  ladder: string
  level: number
  /** Top of range held on every set of the latest session at that level. */
  atTopOfRange?: boolean
  /** Every set of the latest session at that level reached this value. */
  minValue?: number
}

export type LadderStep = {
  level: number
  exercise: string
  nameFr: string
  /** Absent on a `cumulative` step. */
  sets?: number
  range: [number, number]
  unit: Unit
  perSide?: boolean
  /** `cumulative`: the range is the total time accumulated in the session. */
  format?: 'cumulative'
  /** Cumulative steps: what counts as mastering the skill. */
  pass?: { sets: number; hold: number; unit: Unit }
  final?: boolean
}

export type Ladder = {
  id: string
  family: Family
  skill?: string
  priority?: number
  nameFr: string
  contexts: Context[]
  /** Every condition must hold to unlock the ladder. `null`: open from the start. */
  entry: EntryCondition[] | null
  notes?: string
  steps: LadderStep[]
}

// -- State -------------------------------------------------------------------

export type LadderState = {
  ladderId: string
  /** False until the entry conditions hold (skills only). */
  unlocked: boolean
  level: number
  /** Target per set (reps or seconds); one value for a cumulative step. */
  targets: number[]
  /** Consecutive qualifying sessions toward the next step. */
  topStreak: number
  /** Consecutive sessions meeting the regress condition. */
  regressStreak: number
  /** The next step is proposed and waits for Anthony's answer at the review. */
  stepUpProposed: boolean
  /** Sessions logged at the current level. */
  sessionsAtLevel: number
  /** Last session's values at the current level, for entry conditions. */
  lastValues: number[] | null
  /** Pain: progression frozen until the family is cleared at a review. */
  frozen: boolean
  /** Recurring pain: the family is paused until Anthony reactivates it. */
  paused: boolean
  /** Last date the ladder was trained, for the travel freeze. */
  lastTrained: IsoDate | null
}

export type EllipticalState = {
  /** Endurance session length. */
  durationMin: number
  resistance: number
  /** Consecutive weeks with every endurance session at 40-45 min, RPE <= 5, HR in zone. */
  stableWeeks: number
  /** Interval reps once intervals have started (6 to 10), else null. */
  intervalReps: number | null
}

// -- Logs ----------------------------------------------------------------------

export type ExerciseResult = {
  ladderId: string
  level: number
  /** Value per set: reps, or seconds held. For a cumulative step, each hold. */
  values: number[]
  feeling: Feeling
  pain: boolean
}

export type SessionKind = 'calisthenics' | 'nomad' | 'park' | 'elliptical'

export type SessionLog = {
  sessionId: string
  date: IsoDate
  kind: SessionKind
  results: ExerciseResult[]
}

export type CardioEntry = {
  /** Garmin activity date-time, the dedup key. */
  id: string
  date: IsoDate
  type: string
  durationMin: number
  avgHr: number | null
  maxHr: number | null
  calories: number | null
  /** Entered by hand after the import. */
  resistance: number | null
  /** Perceived effort, 1-10, entered by hand. */
  rpe: number | null
}

// -- Plan ------------------------------------------------------------------------

export type PlannedExercise = {
  ladderId: string
  level: number
  exercise: string
  nameFr: string
  sets: number
  targets: number[]
  unit: Unit
  perSide: boolean
  cumulative: boolean
  restSec: number
}

/** A timed block of the sequencer. */
export type SequenceBlock = { label: string; seconds: number; kind: 'work' | 'rest' }
export type Sequence = { label: string; rounds: number; blocks: SequenceBlock[] }

export type PlannedSession = {
  id: string
  date: IsoDate
  kind: SessionKind
  context: Context
  title: string
  durationMin: number
  exercises: PlannedExercise[]
  sequences: Sequence[]
  /** Elliptical: target duration, resistance and HR zone. */
  cardio?: { durationMin: number; resistance: number | null; hrZone: [number, number] | null }
  status: 'planned' | 'done' | 'missed' | 'abandoned'
  /** Where a missed session came from. */
  movedFrom?: IsoDate
  /** The coach's one-line note for this session, from the weekly plan. */
  coachNote?: string
  /** Accessories the coach added from the pool (at most 2 per session). */
  accessories?: Accessory[]
  /** Created in Google Calendar through "Ajouter à mon agenda". */
  inCalendar?: boolean
}

export type Accessory = {
  exercise: string
  nameFr: string
  sets: number
  target: number
  unit: Unit
}

export type WeekPlan = {
  weekId: WeekId
  deload: boolean
  trips: { from: IsoDate; to: IsoDate; confirmed: boolean }[]
  sessions: PlannedSession[]
}

// -- Profile -----------------------------------------------------------------------

export type Profile = {
  createdAt: IsoDate
  /** Weekdays available for training, 1 = Monday … 7 = Sunday. */
  availableDays: number[]
  calisthenicsPerWeek: number
  ellipticalPerWeek: number
  parkSessions: boolean
  /** Doorway bar length in cm: steps 5-6 of the vertical pull need room. */
  barLengthCm: number | null
  restingHr: number | null
  maxHr: number | null
  age: number | null
  ellipticalResistance: { min: number; max: number }
  freeWallAtHome: boolean
  preferredTime: string
}
