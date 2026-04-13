import type { NavGroup, Room } from './types'

export const portalNavGroups: NavGroup[] = [
  {
    label: 'Portal',
    items: [
      { label: 'Events', href: '/portal/events', icon: 'calendar' },
      { label: 'Space', href: '/portal/space', icon: 'map' },
      { label: 'Community', href: '/portal/people', icon: 'users' },
    ],
  },
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
