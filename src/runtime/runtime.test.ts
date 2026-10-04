import { afterEach, describe, expect, it, vi } from 'vitest'
import { createRuntime } from '.'
import { createClaudeCalendar } from './claude/calendar'
import { createClaudeCoach } from './claude/coach'
import { createClaudeStore } from './claude/store'
import { createDevCalendar, seedEvents } from './dev/calendar'
import { createDevCoach } from './dev/coach'
import { createDevStore } from './dev/store'
import { assertKey } from './keys'
import { prefersDark, startThemeSync } from './theme'
import { CoachError, type CoachRequest } from './types'

function memoryStorage() {
  const map = new Map<string, string>()
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
    key: (i: number) => [...map.keys()][i] ?? null,
    get length() {
      return map.size
    },
  }
}

/** A minimal in-memory stand-in for the `db` capability. */
function fakeDb() {
  const docs = new Map<string, Record<string, unknown>>()
  const writes: string[] = []
  const doc = (path: string) => ({
    id: path.split('/').pop()!,
    path,
    get: async () => ({
      id: path.split('/').pop()!,
      exists: docs.has(path),
      data: () => docs.get(path),
      metadata: { fromCache: false, hasPendingWrites: false },
    }),
    set: async (data: Record<string, unknown>) => {
      writes.push(`set ${path}`)
      await new Promise((r) => setTimeout(r, 5))
      docs.set(path, data)
    },
    delete: async () => {
      writes.push(`delete ${path}`)
      docs.delete(path)
    },
  })
  const collection = (path: string) => ({
    path,
    doc: (id: string) => doc(`${path}/${id}`),
    get: async () => {
      const ids = [...docs.keys()].filter((k) => k.startsWith(`${path}/`))
      return { docs: ids.map((k) => ({ id: k.slice(path.length + 1) })) }
    },
  })
  return { db: { collection, doc } as unknown as DB, docs, writes }
}

const request = (over: Partial<CoachRequest> = {}): CoachRequest => ({
  purpose: 'review',
  input: 'prompt',
  modelTier: 'default',
  devReply: () => 'Réponse du coach de développement.',
  ...over,
})

describe('store keys', () => {
  it('accepts db path segments and rejects the rest', () => {
    expect(() => assertKey('week-2026-W41')).not.toThrow()
    expect(() => assertKey('a/b')).toThrow(TypeError)
    expect(() => assertKey('..')).toThrow(TypeError)
    expect(() => assertKey('')).toThrow(TypeError)
  })
})

describe('dev store', () => {
  it('round-trips JSON values and lists keys by prefix', async () => {
    const store = createDevStore(memoryStorage())
    await store.set('week-2026-W41', { sessions: 3 })
    await store.set('week-2026-W42', { sessions: 4 })
    await store.set('profile', { name: 'Anthony' })
    expect(await store.get('week-2026-W41')).toEqual({ sessions: 3 })
    expect(await store.keys('week-')).toEqual(['week-2026-W41', 'week-2026-W42'])
    await store.delete('profile')
    expect(await store.get('profile')).toBeNull()
  })
})

describe('claude store', () => {
  it('is unavailable without db or without a viewer id', () => {
    expect(createClaudeStore(null, 'u1').available).toBe(false)
    expect(createClaudeStore(fakeDb().db, null).available).toBe(false)
  })

  it('writes under the private subtree, wrapped in an object', async () => {
    const { db, docs } = fakeDb()
    const store = createClaudeStore(db, 'u1')
    await store.set('ladder-state', [1, 2, 3])
    const body = docs.get('data/users/u1/ladder-state')
    expect(body?.v).toEqual([1, 2, 3])
    expect(typeof body?.updatedAt).toBe('string')
    expect(await store.get('ladder-state')).toEqual([1, 2, 3])
    expect(await store.keys()).toEqual(['ladder-state'])
  })

  it('serializes writes to the same key', async () => {
    const { db, docs } = fakeDb()
    const store = createClaudeStore(db, 'u1')
    await Promise.all([store.set('profile', { a: 1 }), store.set('profile', { a: 2 })])
    expect(docs.get('data/users/u1/profile')).toMatchObject({ v: { a: 2 } })
  })
})

describe('claude coach', () => {
  it('passes the model tier and disables the cache for chat', async () => {
    const sample = Object.assign(
      vi.fn(async () => ({ text: 'ok', truncated: false, modelTierApplied: 'complex' as const })),
      { json: vi.fn(), limits: vi.fn() },
    ) as unknown as typeof Claude.sample
    const coach = createClaudeCoach(sample)
    await coach.text(request({ purpose: 'chat', modelTier: 'complex' }))
    expect(sample).toHaveBeenCalledWith('prompt', expect.objectContaining({ modelTier: 'complex', cache: false }))
  })

  it('maps refusals of consent to not_granted', async () => {
    const sample = Object.assign(
      vi.fn(async () => {
        throw { code: 'sampling_disabled', message: 'off' }
      }),
      { json: vi.fn(), limits: vi.fn() },
    ) as unknown as typeof Claude.sample
    await expect(createClaudeCoach(sample).text(request())).rejects.toMatchObject({ code: 'not_granted' })
  })

  it('is unavailable without the sample capability', async () => {
    const coach = createClaudeCoach(null)
    expect(coach.available).toBe(false)
    await expect(coach.text(request())).rejects.toBeInstanceOf(CoachError)
  })
})

describe('dev coach', () => {
  it('streams the scripted reply and resolves with it', async () => {
    const seen: string[] = []
    const text = await createDevCoach().text(request({ onText: (t) => seen.push(t) }))
    expect(text).toBe('Réponse du coach de développement.')
    expect(seen.at(-1)).toBe(text)
  })

  it('parses JSON replies', async () => {
    const data = await createDevCoach().json<{ ok: boolean }>(request({ devReply: () => '{"ok":true}' }))
    expect(data.ok).toBe(true)
  })

  it('rejects cancelled when aborted', async () => {
    const ctl = new AbortController()
    const call = createDevCoach().text(request({ signal: ctl.signal }))
    ctl.abort()
    await expect(call).rejects.toMatchObject({ code: 'cancelled' })
  })
})

describe('calendars', () => {
  it('seeds a two-day trip to Paris next week', () => {
    const [trip] = seedEvents(new Date(2026, 9, 4)) // Sunday 4 October 2026
    expect(trip).toMatchObject({ title: 'Paris', start: '2026-10-06', end: '2026-10-08', allDay: true })
  })

  it('lists overlapping events and keeps created sessions', async () => {
    const calendar = createDevCalendar(createDevStore(memoryStorage()))
    const [trip] = await calendar.listEvents('2000-01-01', '2100-01-01')
    expect(trip.title).toBe('Paris')
    expect(await calendar.listEvents('1999-01-01', '1999-02-01')).toEqual([])
    await calendar.createEvents([{ title: 'Séance', start: '2026-10-06T18:30:00', end: '2026-10-06T19:15:00' }])
    expect(await calendar.listEvents('2026-10-06', '2026-10-07')).toContainEqual(
      expect.objectContaining({ title: 'Séance', allDay: false }),
    )
    expect(await calendar.listEvents('2026-10-07', '2026-10-08')).not.toContainEqual(
      expect.objectContaining({ title: 'Séance' }),
    )
  })

  it('keeps the claude.ai calendar unavailable until its bindings are observed', () => {
    const mcp = {} as typeof Claude.mcp
    expect(createClaudeCalendar(mcp).available).toBe(false)
  })
})

describe('theme', () => {
  it('follows data-theme, then the system preference', () => {
    const root = document.createElement('html')
    expect(prefersDark(root, true)).toBe(true)
    root.setAttribute('data-theme', 'light')
    expect(prefersDark(root, true)).toBe(false)
    root.setAttribute('data-theme', 'dark')
    expect(prefersDark(root, false)).toBe(true)
  })

  it('toggles .dark when the viewer changes its theme', async () => {
    const root = document.createElement('html')
    const media = { matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }
    const stop = startThemeSync(root, media as unknown as MediaQueryList)
    expect(root.classList.contains('dark')).toBe(false)
    root.setAttribute('data-theme', 'dark')
    await new Promise((r) => setTimeout(r, 0))
    expect(root.classList.contains('dark')).toBe(true)
    stop()
  })
})

describe('createRuntime', () => {
  afterEach(() => {
    delete (window as Partial<Window>).claude
  })

  it('uses the development runtime outside claude.ai', async () => {
    expect((await createRuntime()).kind).toBe('dev')
  })

  it('uses the claude.ai runtime when the viewer provides window.claude', async () => {
    ;(window as Partial<Window>).claude = { use: async () => null } as unknown as Claude
    const runtime = await createRuntime()
    expect(runtime.kind).toBe('claude')
    expect(runtime.store.available).toBe(false)
    expect(runtime.coach.available).toBe(false)
  })
})
