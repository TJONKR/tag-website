export interface Builder {
  name: string
  slug: string
  initials: string
  role: string
  active: boolean
  image?: string
  gradientFrom: string
  gradientTo: string
}

// Gradient palette pairs for visual variety
const gradients: [string, string][] = [
  ['#ff5f1f', '#1a1816'],
  ['#2a2724', '#ff5f1f'],
  ['#5e5850', '#ff5f1f'],
  ['#ff5f1f', '#5e5850'],
  ['#1a1816', '#ff5f1f'],
  ['#ff5f1f', '#2a2724'],
  ['#9b9589', '#1a1816'],
  ['#ff5f1f', '#9b9589'],
  ['#5e5850', '#2a2724'],
  ['#2a2724', '#5e5850'],
  ['#ff5f1f', '#141210'],
  ['#141210', '#ff5f1f'],
  ['#9b9589', '#ff5f1f'],
  ['#ff5f1f', '#0e0d0b'],
  ['#2a2724', '#9b9589'],
  ['#0e0d0b', '#ff5f1f'],
]

const g = (i: number): [string, string] => gradients[i % gradients.length]

const makeBuilder = (
  name: string,
  role: string,
  active: boolean,
  i: number,
  image?: string
): Builder => {
  const parts = name.split(' ')
  const initials =
    parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase()
  const slug = name.toLowerCase().replace(/\s+/g, '-')
  const [gradientFrom, gradientTo] = g(i)
  return { name, slug, initials, role, active, image, gradientFrom, gradientTo }
}

export const builders: Builder[] = [
  makeBuilder('Tijs Nieuwboer', 'Founder', true, 0, '/images/builders/tijs-nieuwboer.jpg'),
  makeBuilder('Kevin Muiser', 'Managing Director', true, 1, '/images/builders/kevin-muiser.jpg'),
  makeBuilder('Boris de Wit', 'AI & Agentic Dev', true, 2, '/images/builders/boris-de-wit.jpg'),
  makeBuilder('Tim Robben', 'Software Engineer', true, 3, '/images/builders/tim-robben.jpg'),
  makeBuilder('Bram van Rijen', 'Software Engineer', true, 4, '/images/builders/bram-van-rijen.jpg'),
  makeBuilder(
    'Caesar Schoorl',
    'AI Trainer & Speaker',
    true,
    5,
    '/images/builders/caesar-schoorl.jpg'
  ),
  makeBuilder(
    'Miguel Castillo',
    'Co-Founder & CPO',
    true,
    6,
    '/images/builders/miguel-castillo.jpg'
  ),
  makeBuilder(
    'Thomas Termaat',
    'Creative Director',
    true,
    7,
    '/images/builders/thomas-termaat.jpg'
  ),
  makeBuilder(
    'Maarten van Gennip',
    'AI & Automation',
    true,
    8,
    '/images/builders/maarten-van-gennip.jpg'
  ),
  makeBuilder(
    'Carolina Posma',
    'Founder, Postiv AI',
    true,
    9,
    '/images/builders/carolina-posma.jpg'
  ),
  makeBuilder('Denny Smit', 'Data Engineer', true, 10, '/images/builders/denny-smit.jpg'),
  makeBuilder(
    'Jan van Musscher',
    'Founder, Postiv AI',
    true,
    11,
    '/images/builders/jan-van-musscher.jpg'
  ),
  makeBuilder(
    'Jordan Gallant',
    'Security Consultant',
    true,
    12,
    '/images/builders/jordan-gallant.jpg'
  ),
  makeBuilder(
    'Maarten Smulders',
    'Trainer',
    true,
    13,
    '/images/builders/maarten-smulders.jpg'
  ),
  makeBuilder(
    'Pieter de Kroon',
    'Product Designer',
    true,
    14,
    '/images/builders/pieter-de-kroon.jpg'
  ),
  makeBuilder(
    'Tijmen de Vries',
    'Co-Founder, Kexxu',
    true,
    15,
    '/images/builders/tijmen-de-vries.jpg'
  ),
  makeBuilder(
    'Thomas Huijsmans',
    'Founder, FNDR Studio',
    true,
    0,
    '/images/builders/thomas-huijsmans.jpg'
  ),
  makeBuilder('Valentino Kemper', 'Founder & CEO, VETA-Media', true, 1),
]

// Grid display — all builders
export const gridBuilders: Builder[] = builders

export const COUNTER_TARGET = 427

export const getBuilderBySlug = (slug: string): Builder | undefined =>
  builders.find((b) => b.slug === slug)

export const getActiveBuilders = (): Builder[] => builders.filter((b) => b.active)
