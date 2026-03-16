export type ApplicationStatus = 'pending' | 'accepted' | 'rejected'

export interface Application {
  id: string
  name: string
  email: string
  building: string
  why_tag: string
  referral: string | null
  linkedin_url: string | null
  twitter_url: string | null
  github_url: string | null
  website_url: string | null
  instagram_url: string | null
  status: ApplicationStatus
  reviewed_at: string | null
  reviewed_by: string | null
  created_at: string
}

export interface ApplicationCounts {
  pending: number
  accepted: number
  rejected: number
}
