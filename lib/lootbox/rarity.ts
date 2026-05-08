import type { Rarity } from './types'

// Classic MMO/CS rarity colors: gray → blue → purple.
export const rarityStyles: Record<
  Rarity,
  { border: string; glow: string; text: string; label: string }
> = {
  common: {
    border: 'border-gray-400',
    glow: 'shadow-[0_0_30px_rgba(156,163,175,0.25)]',
    text: 'text-gray-400',
    label: 'Common',
  },
  rare: {
    border: 'border-blue-500',
    glow: 'shadow-[0_0_40px_rgba(59,130,246,0.35)]',
    text: 'text-blue-500',
    label: 'Rare',
  },
  epic: {
    border: 'border-purple-500',
    glow: 'shadow-[0_0_50px_rgba(168,85,247,0.4)]',
    text: 'text-purple-500',
    label: 'Epic',
  },
}
