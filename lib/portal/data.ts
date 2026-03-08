import type { Facility, HouseRule, NavGroup, OpeningHours, Room } from './types'

export const portalNavGroups: NavGroup[] = [
  {
    label: 'Portal',
    items: [
      { label: 'Events', href: '/portal/events', icon: 'calendar' },
      { label: 'Space', href: '/portal/space', icon: 'map' },
      { label: 'Info', href: '/portal/info', icon: 'scroll-text' },
    ],
  },
]

export const houseRules: HouseRule[] = [
  {
    title: 'Respect the space',
    description:
      'Leave your workspace clean and tidy. Put away your belongings and dispose of waste in the correct bin.',
  },
  {
    title: 'Noise level',
    description:
      'Be considerate of others. Use a headset for calls and keep conversations at a reasonable volume.',
  },
  {
    title: 'Guests',
    description:
      'Guests are welcome, but always register them with the community manager. You are responsible for your guests.',
  },
  {
    title: 'No food at workstations',
    description:
      'Eat in the kitchen or lounge area. Drinks with lids are allowed at your workstation.',
  },
  {
    title: 'Keys & access',
    description:
      'Never share your access code or key with others. Report any loss to the community manager immediately.',
  },
  {
    title: 'Safety',
    description:
      'Do not leave valuables unattended. TAG is not liable for loss or theft.',
  },
]

export const facilities: Facility[] = [
  {
    name: 'WiFi',
    description: `Network: ${process.env.NEXT_PUBLIC_WIFI_SSID ?? '—'} | Password: ${process.env.NEXT_PUBLIC_WIFI_PASSWORD ?? '—'}`,
    icon: 'wifi',
  },
  {
    name: 'Meeting Rooms',
    description: 'Bookable via the community manager. Max 2 hours per session.',
    icon: 'users',
  },
  {
    name: 'Kitchen',
    description: 'Coffee, tea and water are free. Fridge available for personal use.',
    icon: 'coffee',
  },
]

export const openingHours: OpeningHours[] = [
  { day: 'Monday', hours: '04:00 – 23:59', building: '08:00 – 17:00' },
  { day: 'Tuesday', hours: '04:00 – 23:59', building: '08:00 – 17:00' },
  { day: 'Wednesday', hours: '04:00 – 23:59', building: '08:00 – 17:00' },
  { day: 'Thursday', hours: '04:00 – 23:59', building: '08:00 – 17:00' },
  { day: 'Friday', hours: '04:00 – 23:59', building: '08:00 – 17:00' },
  { day: 'Saturday', hours: '', building: '', note: 'Available on request' },
  { day: 'Sunday', hours: '', building: '', note: 'Available on request' },
]

export const communityManagers = [
  { name: 'Pieter de Kroon' },
  { name: 'Tijs Nieuwboer' },
  { name: 'Kevin Muiser' },
]

export const rooms: Room[] = [
  {
    name: 'Open Workspace',
    capacity: '30 seats',
    description: 'Flexible workstations in an open area. Ideal for daily work.',
    amenities: ['Power outlets', 'Monitors', 'Ergonomic chairs'],
  },
  {
    name: 'Focus Room',
    capacity: '6 seats',
    description: 'Quiet room for deep work. No conversations or calls.',
    amenities: ['Sound insulation', 'Natural light', 'Adjustable desks'],
  },
  {
    name: 'Meeting Room A',
    capacity: '8 people',
    description: 'Meeting room with presentation screen and whiteboard.',
    amenities: ['Display', 'Whiteboard', 'Video conferencing'],
  },
  {
    name: 'Meeting Room B',
    capacity: '4 people',
    description: 'Small meeting room for quick discussions.',
    amenities: ['Display', 'Whiteboard'],
  },
  {
    name: 'Lounge',
    description: 'Relaxation area with comfortable seating and kitchen.',
    amenities: ['Kitchen', 'Coffee machine', 'Seating area', 'Ping pong table'],
  },
  {
    name: 'Event Space',
    capacity: '50 people',
    description: 'Multi-purpose space for workshops, meetups and presentations.',
    amenities: ['Stage', 'Projector', 'Sound system', 'Flexible setup'],
  },
]
