export interface Partner {
  name: string
  type: string // "Government", "Foundation", "Community"
  description: string
  url?: string
}

export const partners: Partner[] = [
  {
    name: 'Techleap',
    type: 'Government',
    description:
      'The Dutch government-backed platform helping startups scale. We connect our builders to their programs and funding.',
    url: 'https://techleap.nl',
  },
  {
    name: 'Norsken',
    type: 'Foundation',
    description:
      'A Nordic foundation investing in impact. We share the belief that builders change the world.',
    url: 'https://norsken.org',
  },
  {
    name: 'AI Amsterdam',
    type: 'Community',
    description:
      "Amsterdam's AI community. We co-host events and connect builders working on AI.",
    url: 'https://ai.amsterdam',
  },
]
