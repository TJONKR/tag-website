export interface LumaEvent {
  api_id: string
  name: string
  description: string | null
  start_at: string
  end_at: string
  cover_url: string | null
  url: string
  timezone: string
  geo_address_json: {
    city: string | null
    region: string | null
    country: string | null
    latitude: string | null
    longitude: string | null
    full_address: string | null
    place_id: string | null
    description: string | null
  } | null
  visibility: string
  meeting_url: string | null
}

export interface LumaEventEntry {
  api_id: string
  event: LumaEvent
}

export interface LumaTicket {
  api_id: string
  checked_in_at: string | null
  created_at: string
}

export interface LumaGuest {
  api_id: string
  email: string | null
  name: string | null
  approval_status: string
  created_at: string
  event_tickets: LumaTicket[]
}

export interface LumaGuestEntry {
  api_id: string
  guest: LumaGuest
}

export interface LumaPaginatedResponse<T> {
  entries: T[]
  has_more: boolean
  next_cursor: string | null
}
