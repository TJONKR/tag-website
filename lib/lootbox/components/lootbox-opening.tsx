'use client'

import { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Gift, Loader2, ArrowRight, Check, RotateCcw } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@components/ui/dialog'

import { cn } from '@lib/utils'

import type { RolledCard } from '../types'
import { useSkinStatus } from '../hooks'
import { LootboxCard } from './lootbox-card'

type ModalPhase = 'opening' | 'reveal' | 'pick'

interface LootboxOpeningProps {
  hasPhotos: boolean
  /** Number of unopened lootboxes available to roll */
  availableCount?: number
  /** If a skin is already generating/errored from a previous session */
  pendingSkinId?: string | null
  onNeedPhotos?: () => void
}

export const LootboxOpening = ({
  hasPhotos,
  availableCount = 0,
  pendingSkinId = null,
  onNeedPhotos,
}: LootboxOpeningProps) => {
  const [modalOpen, setModalOpen] = useState(false)
  const [modalPhase, setModalPhase] = useState<ModalPhase>('opening')
  const [cards, setCards] = useState<RolledCard[]>([])
  const [lootboxId, setLootboxId] = useState<string | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [activeSkinId, setActiveSkinId] = useState<string | null>(pendingSkinId)
  const [error, setError] = useState<string | null>(null)

  // Poll skin status when we have an active skin
  const { skin } = useSkinStatus({ skinId: activeSkinId })

  const isGenerating = !!activeSkinId && (!skin || skin.status === 'generating')
  const isComplete = skin?.status === 'complete'
  const isError = skin?.status === 'error'

  // Auto-refresh page when skin completes
  useEffect(() => {
    if (isComplete) {
      const timer = setTimeout(() => window.location.reload(), 2000)
      return () => clearTimeout(timer)
    }
  }, [isComplete])

  // ── Open lootbox → launch modal ──
  const handleOpenLootbox = useCallback(async () => {
    if (!hasPhotos) {
      onNeedPhotos?.()
      return
    }

    setModalOpen(true)
    setModalPhase('opening')
    setError(null)
    setSelectedIndex(null)

    try {
      const res = await fetch('/api/lootbox/roll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to open lootbox')
      }

      const data = await res.json()
      setLootboxId(data.lootboxId)
      setCards(data.cards)

      setTimeout(() => setModalPhase('reveal'), 800)
      setTimeout(() => setModalPhase('pick'), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setModalOpen(false)
    }
  }, [hasPhotos, onNeedPhotos])

  // ── Pick a card → start generation → close modal ──
  const handlePick = useCallback(
    async (index: number) => {
      if (modalPhase !== 'pick' || !lootboxId) return
      setSelectedIndex(index)

      const card = cards[index]

      try {
        const res = await fetch('/api/lootbox/choose', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lootboxId, styleId: card.style_id }),
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Failed to choose skin')
        }

        const data = await res.json()
        setActiveSkinId(data.skinId)

        // Brief delay to show selection, then close modal
        setTimeout(() => setModalOpen(false), 800)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
        setSelectedIndex(null)
      }
    },
    [modalPhase, lootboxId, cards]
  )

  // ── Inline widget (sidebar) ──
  return (
    <>
      <div className="rounded-lg border border-tag-orange/30 bg-gradient-to-b from-tag-orange/5 to-transparent p-5">
        <AnimatePresence mode="wait">
          {/* ── Generating state ── */}
          {isGenerating && (
            <motion.div
              key="generating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3"
            >
              <div className="relative flex size-10 shrink-0 items-center justify-center rounded-lg bg-tag-orange/10">
                <Loader2 className="size-5 animate-spin text-tag-orange" />
              </div>
              <div className="flex-1">
                <p className="font-syne text-sm font-bold text-tag-text">
                  Generating your skin...
                </p>
                <p className="mt-0.5 font-mono text-[11px] text-tag-muted">
                  This takes about a minute
                </p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-tag-border">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-tag-orange to-amber-400"
                    initial={{ width: '10%' }}
                    animate={{ width: '85%' }}
                    transition={{ duration: 60, ease: 'linear' }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Complete state ── */}
          {isComplete && skin?.image_url && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3"
            >
              <div className="relative size-12 shrink-0 overflow-hidden rounded-lg border border-tag-orange/30">
                <Image
                  src={skin.image_url}
                  alt="Your skin"
                  fill
                  className="object-cover"
                  sizes="48px"
                  unoptimized
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <Check className="size-3.5 text-green-500" />
                  <p className="font-syne text-sm font-bold text-tag-text">Skin ready!</p>
                </div>
                <p className="mt-0.5 text-xs text-tag-muted">Refreshing profile...</p>
              </div>
            </motion.div>
          )}

          {/* ── Error state ── */}
          {isError && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
                <RotateCcw className="size-5 text-destructive" />
              </div>
              <div className="flex-1">
                <p className="font-syne text-sm font-bold text-tag-text">Generation failed</p>
                <p className="mt-0.5 text-xs text-tag-muted">
                  Something went wrong with the AI.
                </p>
              </div>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch('/api/lootbox/retry', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ skinId: activeSkinId }),
                    })
                    if (!res.ok) {
                      const data = await res.json()
                      throw new Error(data.error || 'Retry failed')
                    }
                    // SWR will pick up the status change to 'generating' automatically
                  } catch (err) {
                    setError(err instanceof Error ? err.message : 'Retry failed')
                  }
                }}
                className="rounded-lg bg-tag-orange/10 px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-tag-orange transition-colors hover:bg-tag-orange/20"
              >
                Retry
              </button>
            </motion.div>
          )}

          {/* ── Idle state: ready to open ── */}
          {!isGenerating && !isComplete && !isError && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3 py-2"
            >
              <motion.div
                animate={{
                  y: [0, -5, 0],
                  rotateZ: [0, -2, 2, 0],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="flex size-12 items-center justify-center rounded-2xl bg-tag-orange/10"
              >
                <Gift className="size-6 text-tag-orange" />
              </motion.div>

              <div className="text-center">
                <p className="font-syne text-sm font-bold text-tag-text">
                  {availableCount > 1
                    ? `${availableCount} lootboxes ready!`
                    : 'Lootbox ready!'}
                </p>
                {!hasPhotos && (
                  <p className="mt-1 text-xs text-amber-400">Upload 3 photos first</p>
                )}
              </div>

              {error && <p className="text-center text-xs text-destructive">{error}</p>}

              <button
                onClick={handleOpenLootbox}
                className={cn(
                  'rounded-lg px-6 py-2 font-mono text-xs font-semibold uppercase tracking-wider transition-all',
                  hasPhotos
                    ? 'bg-tag-orange text-tag-bg hover:bg-tag-orange/90 hover:shadow-[0_0_20px_rgba(255,95,31,0.3)]'
                    : 'bg-tag-border text-tag-muted'
                )}
              >
                Open Lootbox
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Full-screen modal: card pick only ── */}
      <Dialog open={modalOpen} onOpenChange={(v) => !v && modalPhase !== 'opening' && setModalOpen(false)}>
        <DialogContent
          className={cn(
            'max-w-3xl border-tag-border bg-tag-bg p-0',
            'overflow-hidden rounded-2xl',
            modalPhase === 'opening' && '[&>button]:hidden'
          )}
        >
          <DialogTitle className="sr-only">Lootbox Opening</DialogTitle>

          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,95,31,0.08),transparent_60%)]" />

          <div className="relative px-8 py-10 sm:px-12 sm:py-14">
            <AnimatePresence mode="wait">
              {/* Opening animation */}
              {modalPhase === 'opening' && (
                <motion.div
                  key="opening"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-6 py-16"
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.3, 1],
                      rotateZ: [0, -8, 8, -8, 0],
                    }}
                    transition={{ duration: 0.8, ease: 'easeInOut' }}
                    className="flex size-24 items-center justify-center rounded-3xl bg-tag-orange/20"
                  >
                    <Gift className="size-12 text-tag-orange" />
                  </motion.div>
                  <motion.div
                    className="h-1.5 w-48 overflow-hidden rounded-full bg-tag-border"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-tag-orange to-amber-400"
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 0.8 }}
                    />
                  </motion.div>
                  <p className="font-mono text-xs uppercase tracking-widest text-tag-muted">
                    Opening...
                  </p>
                </motion.div>
              )}

              {/* Card reveal + pick */}
              {(modalPhase === 'reveal' || modalPhase === 'pick') && (
                <motion.div
                  key="cards"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-8"
                >
                  <div className="text-center">
                    <h2 className="font-syne text-2xl font-bold text-tag-text sm:text-3xl">
                      {modalPhase === 'reveal' ? 'Cards revealed!' : 'Pick your skin'}
                    </h2>
                    <p className="mt-2 text-sm text-tag-muted sm:text-base">
                      {modalPhase === 'reveal'
                        ? 'Your cards are being revealed...'
                        : 'Choose one card to generate your unique skin'}
                    </p>
                  </div>

                  <div className="mx-auto grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-5">
                    {cards.map((card, i) => (
                      <LootboxCard
                        key={`${card.style_id}-${i}`}
                        card={card}
                        index={i}
                        isRevealed={modalPhase === 'pick' || modalPhase === 'reveal'}
                        isSelected={selectedIndex === i}
                        isDisabled={
                          modalPhase !== 'pick' || (selectedIndex !== null && selectedIndex !== i)
                        }
                        onSelect={() => handlePick(i)}
                      />
                    ))}
                  </div>

                  {selectedIndex !== null && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-center gap-2 text-sm text-tag-muted"
                    >
                      <Loader2 className="size-4 animate-spin" />
                      <span>Generation starting...</span>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
