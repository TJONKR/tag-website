export type EventType = 'Event' | 'Internal Event' | 'Hackathon'

export interface TagEvent {
  id: string
  title: string
  type: EventType
  description: string
  date_iso: string
  location: string
  created_by: string | null
  luma_event_id: string | null
  luma_url: string | null
  start_at: string | null
  end_at: string | null
  cover_url: string | null
  is_externally_managed: boolean
  external_host: string | null
}

export interface EventAttendee {
  user_id: string
  name: string | null
  checked_in_at: string | null
  luma_approval_status: string | null
  registered_at: string | null
  source: string
}

export function formatDateDisplay(dateIso: string): string {
  const date = new Date(dateIso + 'T00:00:00')
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  const day = String(date.getDate()).padStart(2, '0')
  return `${months[date.getMonth()]} ${day}`
}
