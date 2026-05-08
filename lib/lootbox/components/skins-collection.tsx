'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Check, Loader2, Lock, Sparkles, Box, Crown } from 'lucide-react'
import { toast } from 'sonner'

import { cn } from '@lib/utils'

import { rarityStyles } from '../rarity'
import type { LootboxStyle, Rarity, UserSkin } from '../types'

interface SkinsCollectionProps {
  initialSkins: UserSkin[]
  allStyles: LootboxStyle[]
}

const RARITY_ORDER: Rarity[] = ['epic', 'rare', 'common']

const rarityIcon = {
  epic: Crown,
  rare: Box,
  common: Sparkles,
} as const

export const SkinsCollection = ({ initialSkins, allStyles }: SkinsCollectionProps) => {
  const [skins, setSkins] = useState(initialSkins)
  const [equippingId, setEquippingId] = useState<string | null>(null)

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

  // Map of style_id -> the user's owned skin for that style (latest complete wins)
  const ownedByStyleId = new Map<string, UserSkin>()
  for (const skin of skins) {
    if (!skin.style_id) continue
    const existing = ownedByStyleId.get(skin.style_id)
    if (!existing || (skin.status === 'complete' && existing.status !== 'complete')) {
      ownedByStyleId.set(skin.style_id, skin)
    }
  }

  // Orphan skins (no style_id match) — still show them under their rarity
  const orphanSkins = skins.filter((s) => !s.style_id || !allStyles.some((st) => st.id === s.style_id))

  const groups = RARITY_ORDER.map((rarity) => {
    const styles = allStyles.filter((s) => s.rarity === rarity)
    const orphans = orphanSkins.filter((s) => s.rarity === rarity)
    return { rarity, styles, orphans }
  }).filter((g) => g.styles.length > 0 || g.orphans.length > 0)

  const ownedCount = skins.filter((s) => s.status === 'complete').length
  const totalCount = allStyles.length

  if (groups.length === 0) return null

  return (
    <div className="rounded-lg border border-tag-border bg-tag-card">
      <div className="flex items-center justify-between px-6 pt-5 pb-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-tag-dim">
          Skins Collection
        </span>
        <span className="font-mono text-[10px] tracking-[0.1em] text-tag-dim">
          {ownedCount} / {totalCount}
        </span>
      </div>

      <div className="space-y-6 px-6 pb-6">
        {groups.map(({ rarity, styles, orphans }) => {
          const rStyle = rarityStyles[rarity]
          const Icon = rarityIcon[rarity]
          const groupOwned =
            styles.filter((st) => ownedByStyleId.has(st.id)).length + orphans.length

          return (
            <div key={rarity}>
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Icon className={cn('size-3.5', rStyle.text)} />
                  <span
                    className={cn(
                      'font-mono text-[11px] uppercase tracking-[0.15em]',
                      rStyle.text
                    )}
                  >
                    {rStyle.label}
                  </span>
                </div>
                <span className="font-mono text-[10px] tracking-[0.1em] text-tag-dim">
                  {groupOwned} / {styles.length}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {styles.map((style) => {
                  const skin = ownedByStyleId.get(style.id)
                  return (
                    <SkinTile
                      key={style.id}
                      style={style}
                      skin={skin}
                      equippingId={equippingId}
                      onEquip={handleEquip}
                    />
                  )
                })}
                {orphans.map((skin) => (
                  <SkinTile
                    key={skin.id}
                    style={null}
                    skin={skin}
                    equippingId={equippingId}
                    onEquip={handleEquip}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface SkinTileProps {
  style: LootboxStyle | null
  skin: UserSkin | undefined
  equippingId: string | null
  onEquip: (id: string) => void
}

const SkinTile = ({ style, skin, equippingId, onEquip }: SkinTileProps) => {
  const rarity = skin?.rarity ?? style?.rarity ?? 'common'
  const rarityStyle = rarityStyles[rarity]
  const isOwned = !!skin
  const isGenerating = skin?.status === 'generating'
  const isComplete = skin?.status === 'complete'
  const isEquipped = skin?.equipped ?? false
  const isEquipping = equippingId === skin?.id

  const previewSrc = isComplete ? skin?.image_url : style?.preview_url
  const name = style?.name ?? rarityStyle.label

  return (
    <motion.div
      whileHover={isComplete && !isEquipped ? { y: -4 } : undefined}
      className={cn(
        'relative overflow-hidden rounded-xl border-2 transition-colors',
        isEquipped
          ? rarityStyle.border
          : isOwned
            ? 'border-tag-border hover:border-tag-orange/50'
            : 'border-tag-border/40',
        isComplete && !isEquipped && 'cursor-pointer'
      )}
      onClick={() => {
        if (isComplete && !isEquipped && skin) onEquip(skin.id)
      }}
    >
      <div className="relative aspect-[3/4]">
        {isGenerating && (
          <div className="flex h-full items-center justify-center bg-tag-bg">
            <Loader2 className="size-8 animate-spin text-tag-orange/40" />
          </div>
        )}

        {!isGenerating && previewSrc && (
          <Image
            src={previewSrc}
            alt={name}
            fill
            className={cn('object-cover', !isOwned && 'opacity-30 grayscale')}
            sizes="200px"
            unoptimized
          />
        )}

        {!isGenerating && !previewSrc && (
          <div className="flex h-full items-center justify-center bg-tag-bg">
            <Lock className="size-6 text-tag-dim" />
          </div>
        )}

        {!isOwned && previewSrc && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <Lock className="size-5 text-tag-text/80" />
          </div>
        )}

        {skin?.status === 'error' && (
          <div className="absolute inset-0 flex items-center justify-center bg-tag-bg">
            <span className="text-xs text-destructive">Failed</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between bg-tag-bg/80 px-3 py-2 backdrop-blur-sm">
        <span
          className={cn(
            'truncate text-[10px]',
            isOwned ? 'text-tag-muted' : 'text-tag-dim'
          )}
        >
          {name}
        </span>

        {isEquipped && (
          <div className="flex items-center gap-1">
            <Check className="size-3 text-tag-orange" />
            <span className="text-[10px] font-medium text-tag-orange">Equipped</span>
          </div>
        )}

        {isEquipping && <Loader2 className="size-3 animate-spin text-tag-orange" />}
      </div>
    </motion.div>
  )
}
