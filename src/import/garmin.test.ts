import { describe, expect, it } from 'vitest'
import type { CardioEntry } from '@/engine'
import { GarminFormatError, mergeCardio, parseCsv, parseDuration, parseGarminCsv, parseNumber } from './garmin'

// Shaped like the Garmin Connect "Activités" export: quoted fields, `--`,
// thousands separators, a quote before negative numbers, mixed types.
const CSV = [
  '"Activity Type","Date","Favorite","Title","Distance","Calories","Time","Avg HR","Max HR","Avg Bike Cadence","Total Reps","Total Sets","Body Battery Drain"',
  '"Elliptical","2026-09-14 18:32:10","false","Elliptique","--","412","00:40:05","131","149","--","--","--","\'-9"',
  '"Breathwork","2026-09-14 07:01:00","false","Respiration","--","12","00:05:00","58","66","--","--","--","\'1"',
  '"Strength Training","2026-09-13 18:30:00","false","Callisthénie","--","2,992","1:05:30","112","158","--","124","15","\'-14"',
  '"Yoga","2026-09-12 08:00:00","false","Yoga","--","95","00:30:00","88","104","--","--","--","--"',
  '"HIIT","2026-09-11 19:00:00","false","Circuit","--","301","00:25:00","142","171","--","--","--","\'-6"',
  '"Elliptical","not a date","false","?","--","--","--","--","--","--","--","--","--"',
].join('\r\n')

describe('CSV parsing', () => {
  it('honors quotes, commas inside quotes and doubled quotes', () => {
    expect(parseCsv('a,"b,c","d ""e"""\n1,2,3')).toEqual([
      ['a', 'b,c', 'd "e"'],
      ['1', '2', '3'],
    ])
  })

  it('reads Garmin numbers', () => {
    expect(parseNumber('--')).toBeNull()
    expect(parseNumber('2,992')).toBe(2992)
    expect(parseNumber("'-4")).toBe(-4)
    expect(parseNumber('131')).toBe(131)
  })

  it('reads durations', () => {
    expect(parseDuration('00:40:05')).toBe(40)
    expect(parseDuration('1:05:30')).toBe(66)
    expect(parseDuration('35:12')).toBe(35)
    expect(parseDuration('--')).toBeNull()
  })
})

describe('Garmin import', () => {
  it('keeps elliptical, strength and HIIT, and counts the rest', () => {
    const { entries, ignored, invalid } = parseGarminCsv(CSV)
    expect(entries.map((e) => e.type)).toEqual(['Elliptical', 'Strength Training', 'HIIT'])
    expect(ignored).toEqual({ Breathwork: 1, Yoga: 1 })
    expect(invalid).toBe(1)
    expect(entries[0]).toEqual({
      id: '2026-09-14 18:32:10',
      date: '2026-09-14',
      type: 'Elliptical',
      durationMin: 40,
      avgHr: 131,
      maxHr: 149,
      calories: 412,
      resistance: null,
      rpe: null,
    })
    expect(entries[1].calories).toBe(2992)
  })

  it('says what to export when the columns are missing', () => {
    expect(() => parseGarminCsv('Nom,Valeur\nx,1')).toThrow(GarminFormatError)
  })

  it('skips activities already imported, by Date', () => {
    const { entries } = parseGarminCsv(CSV)
    const first = mergeCardio([], entries)
    expect(first.added).toBe(3)
    const again = mergeCardio(first.log, entries)
    expect(again).toMatchObject({ added: 0, duplicates: 3 })
    expect(again.log).toHaveLength(3)
  })

  it('takes the resistance and effort typed by hand the same day', () => {
    const manual: CardioEntry = {
      id: '2026-09-14 manual',
      date: '2026-09-14',
      type: 'Elliptical',
      durationMin: 40,
      avgHr: null,
      maxHr: null,
      calories: null,
      resistance: 7,
      rpe: 4,
    }
    const { log } = mergeCardio([manual], parseGarminCsv(CSV).entries)
    const session = log.find((e) => e.date === '2026-09-14')!
    expect(session).toMatchObject({ id: '2026-09-14 18:32:10', avgHr: 131, resistance: 7, rpe: 4 })
    expect(log.some((e) => e.id.endsWith('manual'))).toBe(false)
  })
})
