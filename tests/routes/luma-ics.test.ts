import { test, expect } from '@playwright/test'

import { parseIcs } from '@lib/luma/ics'

const SAMPLE_ICS = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Luma//TAG//EN
X-WR-CALNAME:TAG
BEGIN:VEVENT
DTSTART:20260425T080000Z
DTEND:20260425T170000Z
DTSTAMP:20260423T121544Z
ORGANIZER;CN="Miguel Castillo":MAILTO:calendar-invite@lu.ma
UID:evt-ENW2Orxqi8AyioQ@events.lu.ma
SUMMARY:Bring Your Own Startup: Coworking for AI Founders
DESCRIPTION:Get up-to-date information at: https://luma.com/l8n22uvt\\n\\nAd
 dress:\\nInit Group / Gebouw\\nAmsterdam, Noord-Holland\\nNetherlands\\n\\nHost
 ed by Miguel Castillo & 3 others
LOCATION:Init Group / Gebouw, Jacob Bontiusplaats 9, 1018 LL Amsterdam, Ne
 therlands
GEO:52.371723;4.9284384
STATUS:TENTATIVE
END:VEVENT
BEGIN:VEVENT
DTSTART:20260516T073000Z
DTEND:20260516T180000Z
ORGANIZER;CN="Maarten van Gennip":MAILTO:calendar-invite@lu.ma
UID:evt-UmbLoD3x9Goh0bq@events.lu.ma
SUMMARY:TAG - Creative AI Hackathon
DESCRIPTION:Get up-to-date information at: https://luma.com/v2biborh
LOCATION:INIT, Jacob Bontiusplaats 11, 1018 LL Amsterdam, Netherlands
GEO:52.3712483;4.9286123
END:VEVENT
END:VCALENDAR`

test.describe('parseIcs', () => {
  test('parses multiple VEVENTs', () => {
    const events = parseIcs(SAMPLE_ICS)
    expect(events).toHaveLength(2)
  })

  test('strips @events.lu.ma suffix from UID', () => {
    const events = parseIcs(SAMPLE_ICS)
    expect(events[0].uid).toBe('evt-ENW2Orxqi8AyioQ')
    expect(events[1].uid).toBe('evt-UmbLoD3x9Goh0bq')
  })

  test('unfolds continuation lines and captures full location', () => {
    const events = parseIcs(SAMPLE_ICS)
    expect(events[0].location).toBe(
      'Init Group / Gebouw, Jacob Bontiusplaats 9, 1018 LL Amsterdam, Netherlands'
    )
  })

  test('extracts public slug from DESCRIPTION', () => {
    const events = parseIcs(SAMPLE_ICS)
    expect(events[0].slug).toBe('l8n22uvt')
    expect(events[0].publicUrl).toBe('https://luma.com/l8n22uvt')
    expect(events[1].slug).toBe('v2biborh')
  })

  test('converts DTSTART to ISO 8601', () => {
    const events = parseIcs(SAMPLE_ICS)
    expect(events[0].startAt).toBe('2026-04-25T08:00:00.000Z')
    expect(events[0].endAt).toBe('2026-04-25T17:00:00.000Z')
  })

  test('parses GEO into lat/lng numbers', () => {
    const events = parseIcs(SAMPLE_ICS)
    expect(events[0].latitude).toBeCloseTo(52.371723, 5)
    expect(events[0].longitude).toBeCloseTo(4.9284384, 5)
  })

  test('extracts organizer CN', () => {
    const events = parseIcs(SAMPLE_ICS)
    expect(events[0].organizer).toBe('Miguel Castillo')
    expect(events[1].organizer).toBe('Maarten van Gennip')
  })

  test('returns empty array for empty feed', () => {
    expect(parseIcs('BEGIN:VCALENDAR\nEND:VCALENDAR')).toEqual([])
  })

  test('skips malformed VEVENT without UID or dates', () => {
    const bad = `BEGIN:VCALENDAR
BEGIN:VEVENT
SUMMARY:No dates
END:VEVENT
END:VCALENDAR`
    expect(parseIcs(bad)).toEqual([])
  })
})
