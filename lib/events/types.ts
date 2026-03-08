export type EventType = 'Event' | 'Internal Event' | 'Hackathon'

export interface TagEvent {
  id: string
  title: string
  type: EventType
  description: string
  date_iso: string
  location: string
  created_by: string | null
}

export function formatDateDisplay(dateIso: string): string {
  const date = new Date(dateIso + 'T00:00:00')
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  const day = String(date.getDate()).padStart(2, '0')
  return `${months[date.getMonth()]} ${day}`
}
