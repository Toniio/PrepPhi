import { describe, expect, it } from 'vitest'
import { placeLadders, type Profile } from '@/engine'
import { createDevStore } from '@/runtime/dev/store'
import { completeOnboarding, logElliptical } from './actions'
import { exportJson, ImportError, loadData, parseImport, saveChanges } from './repository'
import { emptyData, SCHEMA_VERSION } from './schema'

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

const profile: Profile = {
  createdAt: '2026-10-05',
  availableDays: [1, 2, 3, 4, 5, 6, 7],
  calisthenicsPerWeek: 3,
  ellipticalPerWeek: 2,
  parkSessions: false,
  barLengthCm: 90,
  restingHr: 58,
  maxHr: null,
  age: 38,
  ellipticalResistance: { min: 1, max: 16 },
  freeWallAtHome: true,
  preferredTime: '18:30',
}

function onboarded() {
  return completeOnboarding(emptyData(), { profile, tested: {}, today: '2026-10-05' })
}

describe('store round trip', () => {
  it('writes only what changed, one document per week and per month', async () => {
    const store = createDevStore(memoryStorage())
    const data = onboarded()
    await saveChanges(store, emptyData(), data)
    expect(await store.keys()).toEqual(['elliptical', 'ladder-state', 'profile', 'proposals', 'week-2026-W41'])

    const session = data.weeks['2026-W41'].plan.sessions.find((s) => s.kind === 'elliptical')!
    const next = logElliptical(data, {
      weekId: '2026-W41',
      sessionId: session.id,
      date: session.date,
      durationMin: 35,
      rpe: 4,
      resistance: 6,
    })
    await saveChanges(store, data, next)
    expect(await store.keys('cardio-')).toEqual(['cardio-2026-10'])

    const loaded = await loadData(store)
    expect(loaded.profile).toEqual(profile)
    expect(loaded.cardioLog).toHaveLength(1)
    expect(loaded.weeks['2026-W41'].plan.sessions.find((s) => s.id === session.id)?.status).toBe('done')
  })
})

describe('JSON export and import', () => {
  it('exports every document with the schema version, and reads it back', () => {
    const data = onboarded()
    const text = exportJson(data, new Date('2026-10-05T20:00:00Z'))
    const file = JSON.parse(text)
    expect(file).toMatchObject({ app: 'prepphi', schemaVersion: SCHEMA_VERSION, exportedAt: '2026-10-05T20:00:00.000Z' })
    expect(parseImport(text)).toEqual(data)
  })

  it('refuses what is not a PrepPhi export', () => {
    expect(() => parseImport('not json')).toThrow(ImportError)
    expect(() => parseImport('{"app":"other"}')).toThrow(ImportError)
    expect(() => parseImport(JSON.stringify({ app: 'prepphi', schemaVersion: SCHEMA_VERSION + 1 }))).toThrow(
      /plus récente/,
    )
  })

  it('fills documents missing from an older export', () => {
    const partial = { app: 'prepphi', schemaVersion: 1, ladderState: placeLadders({}) }
    const data = parseImport(JSON.stringify(partial))
    expect(data.profile).toBeNull()
    expect(data.cardioLog).toEqual([])
    expect(Object.keys(data.ladderState)).toHaveLength(10)
  })
})
