// Parse Luma's public ICS calendar feed.
//
// Luma returns events that appear on the calendar — including ones co-hosted
// by or pinned from other calendars. The Luma API's list-events and event/get
// endpoints only return events whose primary calendar matches the API key,
// so the ICS feed is the only machine-readable source of the full set.

export interface IcsEvent {
  uid: string // Luma event api_id (evt-XXXX), stripped of @events.lu.ma suffix
  summary: string
  description: string
  location: string
  startAt: string // ISO 8601
  endAt: string // ISO 8601
  latitude: number | null
  longitude: number | null
  organizer: string | null
  // The public URL (luma.com/<slug>) parsed out of DESCRIPTION.
  publicUrl: string | null
  slug: string | null
}

const LUMA_ICS_BASE = 'https://api.lu.ma/ics/get'

export async function fetchCalendarIcs(calendarId: string): Promise<string> {
  const url = `${LUMA_ICS_BASE}?entity=calendar&id=${encodeURIComponent(calendarId)}`
  const res = await fetch(url, { headers: { Accept: 'text/calendar' } })
  if (!res.ok) throw new Error(`Luma ICS fetch failed ${res.status}`)
  return res.text()
}

// ICS content lines longer than 75 octets are folded: continuation lines start
// with a single space or tab. Unfold by joining folded lines back together.
function unfoldLines(raw: string): string[] {
  const lines = raw.split(/\r?\n/)
  const out: string[] = []
  for (const line of lines) {
    if ((line.startsWith(' ') || line.startsWith('\t')) && out.length > 0) {
      out[out.length - 1] += line.slice(1)
    } else {
      out.push(line)
    }
  }
  return out
}

function unescapeIcsText(value: string): string {
  return value
    .replace(/\\n/g, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\')
}

// DTSTART / DTEND in Luma's feed are UTC: YYYYMMDDTHHMMSSZ.
function parseIcsDate(value: string): string {
  const m = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/)
  if (!m) throw new Error(`Unparseable ICS date: ${value}`)
  const [, y, mo, d, h, mi, s] = m
  return `${y}-${mo}-${d}T${h}:${mi}:${s}.000Z`
}

function splitProperty(line: string): { name: string; value: string } | null {
  // Property line: NAME[;PARAM=VALUE...]:VALUE
  const colonIdx = line.indexOf(':')
  if (colonIdx < 0) return null
  const head = line.slice(0, colonIdx)
  const value = line.slice(colonIdx + 1)
  const name = head.split(';')[0].toUpperCase()
  return { name, value }
}

function parsePublicUrl(description: string): { url: string | null; slug: string | null } {
  // Luma prefixes every event description with "Get up-to-date information at: <URL>".
  const match = description.match(/https?:\/\/(?:lu\.ma|luma\.com)\/([a-zA-Z0-9-]+)/)
  if (!match) return { url: null, slug: null }
  return { url: match[0], slug: match[1] }
}

function stripUidSuffix(uid: string): string {
  // ICS UIDs look like evt-XXXX@events.lu.ma; we want the bare api_id.
  const at = uid.indexOf('@')
  return at >= 0 ? uid.slice(0, at) : uid
}

export function parseIcs(raw: string): IcsEvent[] {
  const lines = unfoldLines(raw)
  const events: IcsEvent[] = []
  let current: Partial<IcsEvent> & { rawGeo?: string } | null = null

  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') {
      current = {}
      continue
    }
    if (line === 'END:VEVENT') {
      if (current && current.uid && current.startAt && current.endAt) {
        const description = current.description ?? ''
        const { url, slug } = parsePublicUrl(description)
        const [lat, lng] = (current.rawGeo ?? '').split(';').map(parseFloat)
        events.push({
          uid: stripUidSuffix(current.uid),
          summary: current.summary ?? '',
          description,
          location: current.location ?? '',
          startAt: current.startAt,
          endAt: current.endAt,
          latitude: Number.isFinite(lat) ? lat : null,
          longitude: Number.isFinite(lng) ? lng : null,
          organizer: current.organizer ?? null,
          publicUrl: url,
          slug,
        })
      }
      current = null
      continue
    }
    if (!current) continue

    const prop = splitProperty(line)
    if (!prop) continue

    switch (prop.name) {
      case 'UID':
        current.uid = prop.value
        break
      case 'SUMMARY':
        current.summary = unescapeIcsText(prop.value)
        break
      case 'DESCRIPTION':
        current.description = unescapeIcsText(prop.value)
        break
      case 'LOCATION':
        current.location = unescapeIcsText(prop.value)
        break
      case 'DTSTART':
        current.startAt = parseIcsDate(prop.value)
        break
      case 'DTEND':
        current.endAt = parseIcsDate(prop.value)
        break
      case 'GEO':
        current.rawGeo = prop.value
        break
      case 'ORGANIZER': {
        // Format: ORGANIZER;CN="Name":MAILTO:...
        const cnMatch = line.match(/CN="?([^";:]+)"?/i)
        current.organizer = cnMatch ? cnMatch[1] : null
        break
      }
    }
  }

  return events
}

export async function getCalendarEventsFromIcs(calendarId: string): Promise<IcsEvent[]> {
  const raw = await fetchCalendarIcs(calendarId)
  return parseIcs(raw)
}
