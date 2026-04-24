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

// Short label used in dense lists / rows, e.g. "JAN 15". Accepts either a
// plain date ("2026-01-15") or a full ISO timestamp.
export function formatDateDisplay(dateIso: string): string {
  const iso = dateIso.length === 10 ? dateIso + 'T00:00:00' : dateIso
  const date = new Date(iso)
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  const day = String(date.getDate()).padStart(2, '0')
  return `${months[date.getMonth()]} ${day}`
}

// Long label used in detail sheets / headings, e.g. "Monday, 15 January 2026".
export function formatDateFull(dateIso: string): string {
  const iso = dateIso.length === 10 ? dateIso + 'T00:00:00' : dateIso
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
