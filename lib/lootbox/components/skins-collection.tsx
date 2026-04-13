'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Check, Loader2, Sparkles, Box, Crown } from 'lucide-react'
import { toast } from 'sonner'

import { cn } from '@lib/utils'

import type { UserSkin } from '../types'

interface SkinsCollectionProps {
  initialSkins: UserSkin[]
}

export const SkinsCollection = ({ initialSkins }: SkinsCollectionProps) => {
  const [skins, setSkins] = useState(initialSkins)
  const [equippingId, setEquippingId] = useState<string | null>(null)

  if (!skins.length) return null

  const handleEquip = async (skinId: string) => {
    setEquippingId(skinId)
    try {
      const res = await fetch('/api/lootbox/equip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skinId }),
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Failed to equip skin')
        return
      }

      setSkins((prev) =>
        prev.map((s) => ({
          ...s,
          equipped: s.id === skinId,
        }))
      )
      toast.success('Skin equipped!')
      window.location.reload()
    } catch {
      toast.error('Failed to equip skin')
    } finally {
      setEquippingId(null)
    }
  }

  return (
    <div className="rounded-lg border border-tag-border bg-tag-card">
      <div className="px-6 pt-5 pb-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-tag-dim">
          Skins Collection
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 px-6 pb-6 sm:grid-cols-3">
        {skins.map((skin) => {
          const isRare = skin.rarity === 'rare'
          const isEpic = skin.rarity === 'epic'
          const isGenerating = skin.status === 'generating'
          const isComplete = skin.status === 'complete'

          return (
            <motion.div
              key={skin.id}
              whileHover={isComplete ? { y: -4 } : undefined}
              className={cn(
                'relative overflow-hidden rounded-xl border-2 transition-colors',
                skin.equipped
                  ? isEpic
                    ? 'border-purple-400'
                    : isRare
                      ? 'border-amber-400'
                      : 'border-tag-orange'
                  : 'border-tag-border',
                isComplete && 'cursor-pointer hover:border-tag-orange/50'
              )}
              onClick={() => {
                if (isComplete && !skin.equipped) handleEquip(skin.id)
              }}
            >
              <div className="relative aspect-[3/4]">
                {isGenerating && (
                  <div className="flex h-full items-center justify-center bg-tag-bg">
                    <Loader2 className="size-8 animate-spin text-tag-orange/40" />
                  </div>
                )}

                {isComplete && skin.image_url && (
                  <Image
                    src={skin.image_url}
                    alt="Skin"
                    fill
                    className="object-cover"
                    sizes="200px"
                    unoptimized
                  />
                )}

                {skin.status === 'error' && (
                  <div className="flex h-full items-center justify-center bg-tag-bg">
                    <span className="text-xs text-destructive">Failed</span>
                  </div>
                )}
              </div>

              {/* Info bar */}
              <div className="flex items-center justify-between bg-tag-bg/80 px-3 py-2 backdrop-blur-sm">
                <div className="flex items-center gap-1.5">
                  {isEpic ? (
                    <Crown className="size-3 text-purple-400" />
                  ) : isRare ? (
                    <Box className="size-3 text-amber-400" />
                  ) : (
                    <Sparkles className="size-3 text-tag-orange" />
                  )}
                  <span className="text-[10px] text-tag-muted">
                    {(skin.style as { name?: string } | undefined)?.name ?? skin.rarity}
                  </span>
                </div>

                {skin.equipped && (
                  <div className="flex items-center gap-1">
                    <Check className="size-3 text-tag-orange" />
                    <span className="text-[10px] font-medium text-tag-orange">Equipped</span>
                  </div>
                )}

                {equippingId === skin.id && (
                  <Loader2 className="size-3 animate-spin text-tag-orange" />
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
