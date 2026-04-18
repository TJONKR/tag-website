export type UserRole = 'ambassador' | 'builder' | 'operator'

export interface AuthUser {
  id: string
  email: string
  name: string | null
  role: UserRole
  avatar_url: string | null
  created_at: string
  is_super_admin: boolean
}

export interface PublicProfile {
  id: string
  name: string | null
  role: UserRole
  avatar_url: string | null
  building: string | null
  why_tag: string | null
  linkedin_url: string | null
  twitter_url: string | null
  github_url: string | null
  website_url: string | null
  instagram_url: string | null
  created_at: string
  equipped_skin_url: string | null
  taste: PublicTaste | null
}

export interface PublicTaste {
  headline: string | null
  bio: string | null
  tags: string[] | null
  projects: { name: string; description: string; url?: string; role?: string }[] | null
  interests: string[] | null
  notable_work: string[] | null
  influences: string[] | null
  key_links: { url: string; title: string; type: string }[] | null
}

export interface LoginActionState {
  status:
    | 'idle'
    | 'invalid_data'
    | 'invalid_credentials'
    | 'email_not_confirmed'
    | 'rate_limited'
    | 'failed'
    | 'success'
  message?: string
}
