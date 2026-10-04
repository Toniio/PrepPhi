import type {
  CardioEntry,
  EllipticalState,
  IsoDate,
  LadderState,
  Profile,
  ProgressionEvent,
  SessionLog,
  WeekId,
  WeekPlan,
} from '@/engine'

// Everything PrepPhi keeps, exportable as one versioned JSON (CLAUDE.md,
// "Modèle de données"). Bump SCHEMA_VERSION and add a migration in
// repository.ts whenever a stored shape changes.

export const SCHEMA_VERSION = 1

export type WeekDoc = {
  plan: WeekPlan
  logs: SessionLog[]
  events: { date: IsoDate; event: ProgressionEvent }[]
}

export type ChatTurn = { role: 'user' | 'assistant'; content: string; at: string }

export type ReviewRecord = {
  weekId: WeekId
  /** The coach's summary of the week, from the weekly plan call. */
  summary: string | null
  messages: ChatTurn[]
  /** Next week was planned from this review. */
  planned: boolean
}

export type ReviewSummary = {
  /** Cumulative summary, rewritten by the coach at each review. */
  text: string
  throughWeek: WeekId
  updatedAt: string
}

/** A change to a ladder or a threshold, waiting for Anthony's approval. Never applied by the app. */
export type Proposal = {
  id: string
  createdAt: string
  textFr: string
  status: 'pending' | 'accepted' | 'declined'
}

export type AppData = {
  schemaVersion: number
  profile: Profile | null
  ladderState: Record<string, LadderState>
  elliptical: EllipticalState | null
  weeks: Record<WeekId, WeekDoc>
  cardioLog: CardioEntry[]
  reviews: Record<WeekId, ReviewRecord>
  reviewSummary: ReviewSummary | null
  proposals: Proposal[]
}

export function emptyData(): AppData {
  return {
    schemaVersion: SCHEMA_VERSION,
    profile: null,
    ladderState: {},
    elliptical: null,
    weeks: {},
    cardioLog: [],
    reviews: {},
    reviewSummary: null,
    proposals: [],
  }
}

// Store keys: one document per key, partitioned so none grows past the db
// limit (one week per key, one month of cardio per key).
export const KEYS = {
  profile: 'profile',
  ladderState: 'ladder-state',
  elliptical: 'elliptical',
  reviewSummary: 'review-summary',
  proposals: 'proposals',
  week: (id: WeekId) => `week-${id}`,
  review: (id: WeekId) => `review-${id}`,
  cardio: (month: string) => `cardio-${month}`,
} as const
