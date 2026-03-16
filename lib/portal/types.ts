import type { UserRole } from '@lib/auth/types'

export interface NavItem {
  label: string
  href: string
  icon: string
  requiredRole?: UserRole
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export interface HouseRule {
  id: string
  title: string
  description: string
  sort_order: number
}

export interface Facility {
  id: string
  name: string
  description: string
  icon: string
  sort_order: number
}

export interface OpeningHours {
  id: string
  day: string
  hours: string
  building: string
  note: string | null
  sort_order: number
}

export interface ContactInfo {
  type: string
  label: string
  value: string
  href?: string
}

export interface Room {
  name: string
  capacity?: string
  description: string
  amenities: string[]
}
