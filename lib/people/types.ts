import type { UserRole } from '@lib/auth/types'

export interface Member {
  id: string
  email: string
  name: string | null
  role: UserRole
  avatar_url: string | null
  building: string | null
  onboarding_completed: boolean
  created_at: string
}

export interface MemberCounts {
  ambassador: number
  builder: number
  operator: number
  total: number
}
