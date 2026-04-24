'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Check, Loader2 } from 'lucide-react'

import { cn } from '@lib/utils'

import { useSkinStatus } from '../hooks'
import { rarityStyles } from '../rarity'

interface SkinResultProps {
  skinId: string
  onComplete?: () => void
}

export const SkinResult = ({ skinId, onComplete }: SkinResultProps) => {
  const { skin } = useSkinStatus({ skinId })

  const isGenerating = !skin || skin.status === 'generating'
  const isComplete = skin?.status === 'complete'
  const isError = skin?.status === 'error'
  const isRare = skin?.rarity === 'rare'
  const isEpic = skin?.rarity === 'epic'

  // Notify parent when generation completes
  if (isComplete && onComplete) {
    onComplete()
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Generation in progress */}
      {isGenerating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <div
              className={cn(
                'size-32 rounded-2xl',
                'bg-gradient-to-b from-tag-orange/10 to-tag-bg',
                'border-2 border-tag-orange/20',
                'flex items-center justify-center'
              )}
            >
              <Loader2 className="size-10 animate-spin text-tag-orange" />
            </div>
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-tag-orange/5 to-transparent"
              animate={{ x: [-128, 128] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            />
          </div>
          <div className="text-center">
            <p className="font-syne text-sm font-bold text-tag-text">Generating your skin...</p>
            <p className="mt-1 font-mono text-[11px] text-tag-muted">
              {isEpic
                ? 'Forging epic 2D art + 3D model'
                : isRare
                  ? 'Creating 2D art + 3D model'
                  : 'Creating your unique artwork'}
            </p>
          </div>
        </motion.div>
      )}

      {/* Complete */}
      {isComplete && skin?.image_url && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="flex flex-col items-center gap-4"
        >
          <div
            className={cn(
              'relative aspect-[3/4] w-48 overflow-hidden rounded-2xl border-2',
              rarityStyles[skin.rarity].border,
              rarityStyles[skin.rarity].glow
            )}
          >
            <Image
              src={skin.image_url}
              alt="Your new skin"
              fill
              className="object-cover"
              sizes="192px"
              unoptimized
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex size-5 items-center justify-center rounded-full bg-green-500">
              <Check className="size-3 text-white" />
            </div>
            <span className="font-syne text-sm font-bold text-tag-text">Skin equipped!</span>
          </div>
        </motion.div>
      )}

      {/* Error */}
      {isError && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <p className="font-syne text-sm font-bold text-destructive">Generation failed</p>
          <p className="mt-1 text-xs text-tag-muted">
            Something went wrong. Please try again later.
          </p>
        </motion.div>
      )}
    </div>
  )
}
