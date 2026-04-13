'use client'

import { motion } from 'framer-motion'
import { Sparkles, Box, Crown } from 'lucide-react'

import { cn } from '@lib/utils'

import type { RolledCard } from '../types'

interface LootboxCardProps {
  card: RolledCard
  index: number
  isRevealed: boolean
  isSelected: boolean
  isDisabled: boolean
  onSelect: () => void
}

export const LootboxCard = ({
  card,
  index,
  isRevealed,
  isSelected,
  isDisabled,
  onSelect,
}: LootboxCardProps) => {
  const isRare = card.rarity === 'rare'
  const isEpic = card.rarity === 'epic'

  const rarityColor = isEpic
    ? 'text-purple-400'
    : isRare
      ? 'text-amber-400'
      : 'text-tag-orange'

  const rarityBg = isEpic
    ? 'bg-purple-400/20'
    : isRare
      ? 'bg-amber-400/20'
      : 'bg-tag-orange/10'

  const rarityBadgeBg = isEpic
    ? 'bg-purple-400/10 text-purple-400'
    : isRare
      ? 'bg-amber-400/10 text-amber-400'
      : 'bg-tag-orange/10 text-tag-orange'

  return (
    <motion.div
      initial={{ y: -200, opacity: 0, rotateZ: Math.random() * 30 - 15 }}
      animate={{
        y: 0,
        opacity: 1,
        rotateZ: 0,
        scale: isSelected ? 1.05 : 1,
      }}
      transition={{
        type: 'spring',
        stiffness: 200,
        damping: 20,
        delay: index * 0.15,
      }}
      className="perspective-1000"
    >
      <motion.button
        onClick={onSelect}
        disabled={isDisabled}
        whileHover={!isDisabled ? { y: -8 } : undefined}
        whileTap={!isDisabled ? { scale: 0.95 } : undefined}
        className={cn(
          'relative w-full cursor-pointer',
          'rounded-xl border-2 p-1 transition-colors',
          isSelected
            ? isEpic
              ? 'border-purple-400 shadow-[0_0_40px_rgba(168,85,247,0.4)]'
              : isRare
                ? 'border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.3)]'
                : 'border-tag-orange shadow-[0_0_20px_rgba(255,95,31,0.2)]'
            : 'border-tag-border hover:border-tag-orange/50',
          isDisabled && !isSelected && 'cursor-not-allowed opacity-40'
        )}
      >
        {/* Card face */}
        <div
          className={cn(
            'relative aspect-[3/4] overflow-hidden rounded-lg',
            'bg-gradient-to-b',
            isRevealed
              ? isEpic
                ? 'from-purple-900/50 to-purple-950/70'
                : isRare
                  ? 'from-amber-900/40 to-amber-950/60'
                  : 'from-tag-orange/10 to-tag-bg'
              : 'from-tag-card to-tag-bg'
          )}
        >
          {/* Unrevealed state */}
          {!isRevealed && (
            <div className="flex h-full items-center justify-center">
              <motion.div
                animate={{ rotateY: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              >
                <Box className="size-10 text-tag-orange/40" />
              </motion.div>
            </div>
          )}

          {/* Revealed state */}
          {isRevealed && (
            <motion.div
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: index * 0.15 + 0.5 }}
              className="flex h-full flex-col items-center justify-center gap-3 p-4"
            >
              {/* Rarity glow */}
              {(isRare || isEpic) && (
                <motion.div
                  className="absolute inset-0 rounded-lg"
                  animate={{
                    boxShadow: isEpic
                      ? [
                          'inset 0 0 30px rgba(168,85,247,0.15)',
                          'inset 0 0 60px rgba(168,85,247,0.3)',
                          'inset 0 0 30px rgba(168,85,247,0.15)',
                        ]
                      : [
                          'inset 0 0 20px rgba(251,191,36,0.1)',
                          'inset 0 0 40px rgba(251,191,36,0.2)',
                          'inset 0 0 20px rgba(251,191,36,0.1)',
                        ],
                  }}
                  transition={{ duration: isEpic ? 1.5 : 2, repeat: Infinity }}
                />
              )}

              {/* Style icon */}
              <div className={cn('flex size-14 items-center justify-center rounded-full', rarityBg)}>
                {isEpic ? (
                  <Crown className={cn('size-7', rarityColor)} />
                ) : card.generation_type === '3d' ? (
                  <Box className={cn('size-7', rarityColor)} />
                ) : (
                  <Sparkles className={cn('size-7', rarityColor)} />
                )}
              </div>

              {/* Style name */}
              <p
                className={cn(
                  'text-center font-syne text-sm font-bold',
                  isEpic ? 'text-purple-400' : isRare ? 'text-amber-400' : 'text-tag-text'
                )}
              >
                {card.name}
              </p>

              {/* Rarity badge */}
              <span
                className={cn(
                  'rounded-full px-3 py-0.5 font-mono text-[10px] uppercase tracking-wider',
                  rarityBadgeBg
                )}
              >
                {card.rarity}
              </span>

              {/* Generation type */}
              <span className="font-mono text-[10px] text-tag-dim">
                {card.generation_type === '3d' ? '3D Model' : '2D Art'}
              </span>
            </motion.div>
          )}
        </div>

        {/* Selected indicator */}
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={cn(
              'absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full',
              isEpic ? 'bg-purple-400' : isRare ? 'bg-amber-400' : 'bg-tag-orange'
            )}
          >
            <span className="text-xs font-bold text-tag-bg">✓</span>
          </motion.div>
        )}
      </motion.button>
    </motion.div>
  )
}
