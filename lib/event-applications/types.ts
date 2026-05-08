export type EventApplicationStatus = 'pending' | 'approved' | 'rejected' | 'archived'

export type EventType =
  | 'talk'
  | 'workshop'
  | 'meetup'
  | 'hackathon'
  | 'launch'
  | 'other'

export interface EventHostApplication {
  id: string
  name: string
  email: string
  phone: string | null
  organization: string | null
  event_title: string
  event_type: EventType
  description: string
  expected_attendees: number | null
  proposed_date: string | null
  proposed_date_flexible: boolean
  duration_hours: number | null
  website_url: string | null
  social_url: string | null
  status: EventApplicationStatus
  reviewed_at: string | null
  reviewed_by: string | null
  created_at: string
  ip_hash: string | null
  user_agent: string | null
}

export interface EventApplicationCounts {
  pending: number
  approved: number
  rejected: number
  archived: number
}
