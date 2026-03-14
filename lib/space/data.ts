export interface Amenity {
  icon: string
  label: string
  description: string
}

export interface PricingTier {
  name: string
  price: string
  period: string
  description: string
  features: string[]
  highlighted?: boolean
}

export const amenities: Amenity[] = [
  {
    icon: 'Monitor',
    label: 'Dedicated Desk',
    description: 'Your own permanent workspace, set up the way you like it.',
  },
  {
    icon: 'Wifi',
    label: 'Fast Internet',
    description: 'Gigabit fiber so your deploys never buffer.',
  },
  {
    icon: 'Users',
    label: 'Builder Community',
    description: 'Surrounded by people who ship. Every single day.',
  },
  {
    icon: 'Calendar',
    label: 'Weekly Events',
    description: 'Demo nights, hackathons, and build sprints on repeat.',
  },
  {
    icon: 'Coffee',
    label: 'Coffee & Drinks',
    description: 'Fuel included. Espresso, filter, and everything in between.',
  },
  {
    icon: 'Clock',
    label: '24/7 Access',
    description: 'Build at 3am if that is when you are in the zone.',
  },
  {
    icon: 'DoorOpen',
    label: 'Meeting Rooms',
    description: 'Private rooms for calls, pitches, and deep work.',
  },
  {
    icon: 'Presentation',
    label: 'Event Space',
    description: 'A stage for demos, talks, and community gatherings.',
  },
]

export const pricingTiers: PricingTier[] = [
  {
    name: 'Day Pass',
    price: '€25',
    period: '/day',
    description: 'Drop in and build',
    features: ['Desk for the day', 'Fast WiFi', 'Coffee included', 'Community access'],
  },
  {
    name: 'Builder',
    price: '€150',
    period: '/month',
    description: 'For serious builders',
    features: [
      'Dedicated desk',
      '24/7 access',
      'All events included',
      'Builder community',
      'Meeting rooms',
      'Mail address',
    ],
    highlighted: true,
  },
  {
    name: 'Team',
    price: 'Custom',
    period: '',
    description: 'Pricing on request',
    features: [
      'Everything in Builder',
      'Team area',
      'Priority event access',
      'Custom setup',
    ],
  },
]
