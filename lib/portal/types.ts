export interface NavItem {
  label: string
  href: string
  icon: string
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export interface HouseRule {
  title: string
  description: string
}

export interface Facility {
  name: string
  description: string
  icon: string
}

export interface OpeningHours {
  day: string
  hours: string
  building?: string
  note?: string
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
