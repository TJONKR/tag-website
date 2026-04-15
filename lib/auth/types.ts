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
}

export interface LoginActionState {
  status: 'idle' | 'invalid_data' | 'failed' | 'success'
}

export interface RegisterActionState {
  status: 'idle' | 'invalid_data' | 'failed' | 'success'
}
