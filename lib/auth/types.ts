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

export interface LoginActionState {
  status: 'idle' | 'invalid_data' | 'failed' | 'success'
}

export interface RegisterActionState {
  status: 'idle' | 'invalid_data' | 'failed' | 'success'
}
