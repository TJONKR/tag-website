import type {
  LumaEvent,
  LumaEventEntry,
  LumaGuestEntry,
  LumaPaginatedResponse,
} from './types'

const BASE_URL = 'https://public-api.luma.com'

function getApiKey(): string {
  const key = process.env.LUMA_API_KEY
  if (!key) throw new Error('Missing LUMA_API_KEY environment variable')
  return key
}

function getCalendarId(): string {
  const id = process.env.LUMA_CALENDAR_ID
  if (!id) throw new Error('Missing LUMA_CALENDAR_ID environment variable')
  return id
}

async function lumaFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'x-luma-api-key': getApiKey(),
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Luma API error ${res.status}: ${text}`)
  }

  return res.json() as Promise<T>
}

export async function listEvents(opts?: {
  cursor?: string
  limit?: number
}): Promise<LumaPaginatedResponse<LumaEventEntry>> {
  const params = new URLSearchParams({
    series_mode: 'sessions',
    calendar_api_id: getCalendarId(),
  })
  if (opts?.cursor) params.set('pagination_cursor', opts.cursor)
  if (opts?.limit) params.set('pagination_limit', String(opts.limit))

  return lumaFetch(`/public/v1/calendar/list-events?${params}`)
}

export async function getAllEvents(): Promise<LumaEventEntry[]> {
  const all: LumaEventEntry[] = []
  let cursor: string | undefined

  do {
    const page = await listEvents({ cursor })
    all.push(...page.entries)
    cursor = page.has_more && page.next_cursor ? page.next_cursor : undefined
  } while (cursor)

  return all
}

export async function getEvent(eventId: string): Promise<LumaEvent> {
  const data = await lumaFetch<{ event: LumaEvent }>(
    `/public/v1/event/get?event_api_id=${eventId}`
  )
  return data.event
}

export async function createEvent(data: {
  name: string
  description?: string
  start_at: string
  end_at: string
  timezone?: string
}): Promise<LumaEvent> {
  const result = await lumaFetch<{ event: LumaEvent }>('/public/v1/event/create', {
    method: 'POST',
    body: JSON.stringify({
      calendar_api_id: getCalendarId(),
      name: data.name,
      description: data.description,
      start_at: data.start_at,
      end_at: data.end_at,
      timezone: data.timezone ?? 'Europe/Amsterdam',
    }),
  })
  return result.event
}

export async function updateEvent(
  eventId: string,
  data: Partial<{ name: string; description: string; start_at: string; end_at: string }>
): Promise<LumaEvent> {
  const result = await lumaFetch<{ event: LumaEvent }>('/public/v1/event/update', {
    method: 'POST',
    body: JSON.stringify({
      event_api_id: eventId,
      ...data,
    }),
  })
  return result.event
}

export async function getGuests(
  eventId: string,
  cursor?: string
): Promise<LumaPaginatedResponse<LumaGuestEntry>> {
  const params = new URLSearchParams({ event_api_id: eventId })
  if (cursor) params.set('pagination_cursor', cursor)

  return lumaFetch(`/public/v1/event/get-guests?${params}`)
}

export async function getAllGuests(eventId: string): Promise<LumaGuestEntry[]> {
  const all: LumaGuestEntry[] = []
  let cursor: string | undefined

  do {
    const page = await getGuests(eventId, cursor)
    all.push(...page.entries)
    cursor = page.has_more && page.next_cursor ? page.next_cursor : undefined
  } while (cursor)

  return all
}

export async function addGuests(
  eventId: string,
  guests: { email: string; name?: string }[]
): Promise<void> {
  await lumaFetch('/public/v1/event/add-guests', {
    method: 'POST',
    body: JSON.stringify({
      event_api_id: eventId,
      guests: guests.map((g) => ({
        email: g.email,
        name: g.name,
      })),
    }),
  })
}
