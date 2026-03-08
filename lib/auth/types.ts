export type UserRole = 'rookie' | 'builder' | 'admin'

export interface AuthUser {
  id: string
  email: string
  name: string | null
  role: UserRole
}

export interface LoginActionState {
  status: 'idle' | 'invalid_data' | 'failed' | 'success'
}

export interface RegisterActionState {
  status: 'idle' | 'invalid_data' | 'failed' | 'success'
}
