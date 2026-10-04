// The four services every screen uses. Each has a claude.ai implementation
// (runtime capabilities) and a development one, so the whole app runs in
// `npm run dev` without claude.ai.

export type RuntimeKind = 'claude' | 'dev'

// -- Coach ---------------------------------------------------------------

export type CoachPurpose = 'weekly-plan' | 'review' | 'chat'

export type CoachTurn = { role: 'user' | 'assistant'; content: string }

export type CoachRequest = {
  purpose: CoachPurpose
  /** A full prompt, or chat turns starting and ending on a user turn. */
  input: string | CoachTurn[]
  /** `complex` for the weekly plan, `default` for the conversation. */
  modelTier: 'default' | 'complex'
  /** Receives the whole answer so far while it streams. */
  onText?: (text: string) => void
  signal?: AbortSignal
  /**
   * What the scripted development coach answers. Callers derive it from the
   * rules engine, so every screen works offline with a plausible answer.
   */
  devReply: () => string
}

export type CoachErrorCode = 'unavailable' | 'not_granted' | 'cancelled' | 'rate_limited' | 'invalid_json' | 'failed'

export class CoachError extends Error {
  readonly code: CoachErrorCode
  /** The part of the answer that streamed before the failure, if any. */
  readonly partial?: string

  constructor(code: CoachErrorCode, message: string, partial?: string) {
    super(message)
    this.name = 'CoachError'
    this.code = code
    this.partial = partial
  }
}

export interface CoachClient {
  /** False when this view cannot reach the coach: hide the coach features. */
  readonly available: boolean
  text(request: CoachRequest): Promise<string>
  /** The answer parsed as one JSON value. Fields are not validated. */
  json<T>(request: CoachRequest): Promise<T>
}

// -- Store ---------------------------------------------------------------

/**
 * A private key-value store. Keys are single path segments
 * (`profile`, `week-2026-W41`): letters, digits and `_ - . ~ : @ +`.
 * Values are JSON. Keep each value under 200 KiB: partition growing data
 * (one key per week, one per month of cardio).
 */
export interface Store {
  readonly available: boolean
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T): Promise<void>
  delete(key: string): Promise<void>
  /** Every key starting with `prefix`, sorted. */
  keys(prefix?: string): Promise<string[]>
}

// -- Calendar --------------------------------------------------------------

export type CalendarEvent = {
  id: string
  title: string
  /** `YYYY-MM-DD` for an all-day event, an ISO 8601 date-time otherwise. */
  start: string
  /** Exclusive end, same format as `start`. */
  end: string
  allDay: boolean
}

export type NewCalendarEvent = {
  title: string
  /** ISO 8601 local date-time, `2026-10-06T18:30:00`. */
  start: string
  end: string
  description?: string
}

export interface CalendarClient {
  readonly available: boolean
  /** Events overlapping [from, to), dates as `YYYY-MM-DD`. */
  listEvents(from: string, to: string): Promise<CalendarEvent[]>
  /** Creates the events after the user's explicit validation. */
  createEvents(events: NewCalendarEvent[]): Promise<{ created: number }>
}

// -- Downloads -------------------------------------------------------------

export type DownloadOutcome = 'saved' | 'declined' | 'unavailable'

export interface Downloader {
  readonly available: boolean
  save(filename: string, data: string | Blob): Promise<DownloadOutcome>
}

// -- Runtime ---------------------------------------------------------------

export type Runtime = {
  kind: RuntimeKind
  coach: CoachClient
  store: Store
  calendar: CalendarClient
  downloader: Downloader
}
