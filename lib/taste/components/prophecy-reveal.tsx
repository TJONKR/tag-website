'use client'

import { useEffect, useMemo, useState } from 'react'
import { Loader2, Sparkles } from 'lucide-react'

import { Dialog, DialogContent } from '@components/ui/dialog'
import { toast } from '@components/toast'
import { cn } from '@lib/utils'

import type {
  ProphecyCard,
  ProphecyRoundIndex,
  ProphecyRounds,
} from '../types'

interface ProphecyRevealProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialRounds: ProphecyRounds | null
  onFinalized: (chosen: ProphecyCard[]) => void
}

const ROUND_META: Record<
  ProphecyRoundIndex,
  { name: string; tagline: string }
> = {
  1: {
    name: 'Surface',
    tagline: 'What pattern is visible in your work.',
  },
  2: {
    name: 'Undercurrent',
    tagline: 'What drives the pattern.',
  },
  3: {
    name: 'Horizon',
    tagline: 'The impossible shape of where this leads.',
  },
}

type Phase = 'picking' | 'advancing' | 'finalizing' | 'revealed'

export const ProphecyReveal = ({
  open,
  onOpenChange,
  initialRounds,
  onFinalized,
}: ProphecyRevealProps) => {
  const [rounds, setRounds] = useState<ProphecyRounds>(initialRounds ?? [])
  const [phase, setPhase] = useState<Phase>('picking')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [finalized, setFinalized] = useState<ProphecyCard[] | null>(null)

  // Sync when parent gives us new initial rounds (e.g. after draw kicks off).
  useEffect(() => {
    if (!open) return
    if (initialRounds) setRounds(initialRounds)
  }, [open, initialRounds])

  // Reset transient state each time the modal closes.
  useEffect(() => {
    if (open) return
    setSelectedId(null)
    setPhase('picking')
    setFinalized(null)
  }, [open])

  const currentIndex = rounds.length - 1
  const currentRound = rounds[currentIndex]
  const roundIndex = (rounds.length || 1) as ProphecyRoundIndex
  const meta = ROUND_META[roundIndex]

  const hasCards = Boolean(currentRound?.cards?.length)
  const alreadySealed = currentRound?.picked_id !== null && currentRound?.picked_id !== undefined

  const handlePick = async (cardId: string) => {
    if (phase !== 'picking' || !currentRound) return
    setSelectedId(cardId)
    const willFinalize = roundIndex === 3
    setPhase(willFinalize ? 'finalizing' : 'advancing')

    try {
      const res = await fetch('/api/taste/prophecy/advance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pickedCardId: cardId }),
      })
      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean
        finalized?: boolean
        rounds?: ProphecyRounds
        chosen?: ProphecyCard[]
        errors?: { message: string }[]
      }

      if (!res.ok || !json.ok) {
        toast({
          type: 'error',
          description: json.errors?.[0]?.message ?? 'Could not advance.',
        })
        setSelectedId(null)
        setPhase('picking')
        return
      }

      if (json.finalized && json.chosen && json.rounds) {
        setRounds(json.rounds)
        setFinalized(json.chosen)
        setPhase('revealed')
        return
      }

      if (json.rounds) {
        setRounds(json.rounds)
      }
      setSelectedId(null)
      setPhase('picking')
    } catch {
      toast({ type: 'error', description: 'Could not advance.' })
      setSelectedId(null)
      setPhase('picking')
    }
  }

  const handleCloseFinal = () => {
    if (finalized) onFinalized(finalized)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="h-dvh w-screen max-w-none gap-0 overflow-y-auto border-none bg-black p-0 sm:h-[92vh] sm:max-w-5xl sm:rounded-lg sm:border sm:border-tag-border"
      >
        {/* Background gradient */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(242,113,33,0.12),_transparent_55%)]" />

        <div className="relative flex min-h-full flex-col px-5 py-10 sm:px-10 sm:py-12">
          {phase !== 'revealed' && (
            <Header roundIndex={roundIndex} name={meta.name} tagline={meta.tagline} />
          )}

          {/* Body */}
          <div className="mt-10 flex-1">
            {phase === 'revealed' && finalized ? (
              <RevealedFinal cards={finalized} onClose={handleCloseFinal} />
            ) : phase === 'advancing' || phase === 'finalizing' ? (
              <MagicLoading finalizing={phase === 'finalizing'} />
            ) : hasCards && !alreadySealed ? (
              <RoundGrid
                cards={currentRound!.cards}
                selectedId={selectedId}
                onPick={handlePick}
                disabled={Boolean(selectedId)}
              />
            ) : (
              <MagicLoading finalizing={false} />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Header ──

interface HeaderProps {
  roundIndex: ProphecyRoundIndex
  name: string
  tagline: string
}

const Header = ({ roundIndex, name, tagline }: HeaderProps) => (
  <div className="flex flex-col items-center text-center">
    <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-tag-orange">
      <Sparkles className="size-3" />
      the prophecy · round {roundIndex} of 3
      <Sparkles className="size-3" />
    </span>
    <h1 className="mt-3 font-syne text-3xl font-bold text-tag-text sm:text-4xl">
      {name}
    </h1>
    <p className="mt-2 max-w-md text-sm text-tag-muted">{tagline}</p>
    <div className="mt-5 flex items-center gap-2">
      {[1, 2, 3].map((n) => (
        <span
          key={n}
          className={cn(
            'h-1.5 w-8 rounded-full transition-colors',
            n < roundIndex
              ? 'bg-tag-orange'
              : n === roundIndex
                ? 'bg-tag-orange/50'
                : 'bg-tag-border'
          )}
        />
      ))}
    </div>
    <p className="mt-5 max-w-sm font-mono text-[10px] uppercase tracking-[0.2em] text-tag-dim">
      tap the card that pulls at you
    </p>
  </div>
)

// ── Round grid ──

interface RoundGridProps {
  cards: ProphecyCard[]
  selectedId: string | null
  onPick: (id: string) => void
  disabled: boolean
}

const RoundGrid = ({ cards, selectedId, onPick, disabled }: RoundGridProps) => (
  <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 md:grid-cols-4">
    {cards.map((card, i) => (
      <CardTile
        key={card.id}
        card={card}
        isSelected={selectedId === card.id}
        disabled={disabled && selectedId !== card.id}
        onPick={() => onPick(card.id)}
        enterDelay={i * 120}
      />
    ))}
  </div>
)

interface CardTileProps {
  card: ProphecyCard
  isSelected: boolean
  disabled: boolean
  onPick: () => void
  enterDelay: number
}

const CardTile = ({
  card,
  isSelected,
  disabled,
  onPick,
  enterDelay,
}: CardTileProps) => (
  <button
    type="button"
    onClick={onPick}
    disabled={disabled}
    className={cn(
      'group relative flex animate-prophecy-in flex-col overflow-hidden rounded-lg border bg-tag-card text-left transition-all',
      isSelected
        ? 'scale-[1.02] border-tag-orange shadow-lg shadow-tag-orange/30'
        : 'border-tag-border hover:-translate-y-0.5 hover:border-tag-orange/50',
      disabled && 'opacity-30 pointer-events-none'
    )}
    style={{ animationDelay: `${enterDelay}ms` }}
  >
    <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-black via-tag-card to-black">
      {card.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={card.image_url}
          alt=""
          className="size-full object-cover"
          style={{ imageRendering: 'pixelated' }}
        />
      ) : (
        <div className="flex size-full items-center justify-center">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-tag-dim">
            no image
          </span>
        </div>
      )}
      {isSelected && (
        <div className="absolute inset-0 flex items-center justify-center bg-tag-orange/20">
          <span className="rounded-full border border-tag-orange bg-black/60 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-tag-orange">
            chosen
          </span>
        </div>
      )}
    </div>
    <div className="flex flex-1 flex-col gap-2 p-4">
      <h3 className="font-syne text-sm font-bold leading-tight text-tag-text">
        {card.title}
      </h3>
      <p className="text-[12px] leading-relaxed text-tag-muted">
        {card.narrative}
      </p>
    </div>
  </button>
)

// ── Magic loading ──

const LOADING_COPY = [
  'Shuffling the deck around your choice…',
  'Listening to what the card just said…',
  'Peeling back a layer…',
  'Dealing a deeper round…',
]

const FINAL_COPY = [
  'Sealing the prophecy…',
  'The three cards are settling…',
  'Fixing the pattern in place…',
]

const MagicLoading = ({ finalizing }: { finalizing: boolean }) => {
  const copy = useMemo(() => (finalizing ? FINAL_COPY : LOADING_COPY), [finalizing])
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % copy.length), 1800)
    return () => clearInterval(id)
  }, [copy.length])

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-8 text-center">
      <div className="relative size-40">
        {/* Stacked shuffle deck */}
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="absolute inset-0 rounded-lg border border-tag-orange/40 bg-gradient-to-br from-tag-card to-black shadow-lg"
            style={{
              animation: `prophecy-shuffle 2.2s ${i * 0.18}s infinite ease-in-out`,
            }}
          />
        ))}
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="size-8 animate-spin text-tag-orange" />
        </div>
      </div>
      <div>
        <p className="font-syne text-lg text-tag-text">{copy[idx]}</p>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-tag-dim">
          hold the line · the oracle is drawing
        </p>
      </div>
    </div>
  )
}

// ── Final reveal ──

const RevealedFinal = ({
  cards,
  onClose,
}: {
  cards: ProphecyCard[]
  onClose: () => void
}) => (
  <div className="mx-auto flex max-w-4xl flex-col items-center gap-8 text-center">
    <div>
      <span className="flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-tag-orange">
        <Sparkles className="size-3" />
        the prophecy is sealed
        <Sparkles className="size-3" />
      </span>
      <h1 className="mt-3 font-syne text-3xl font-bold text-tag-text sm:text-4xl">
        Your three cards
      </h1>
      <p className="mt-2 text-sm text-tag-muted">
        Surface → Undercurrent → Horizon. This is yours now.
      </p>
    </div>

    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
      {cards.map((card, i) => (
        <div
          key={card.id}
          className="animate-prophecy-in flex flex-col overflow-hidden rounded-lg border border-tag-orange/30 bg-tag-card"
          style={{ animationDelay: `${i * 220}ms` }}
        >
          <div className="aspect-square w-full overflow-hidden bg-black">
            {card.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={card.image_url}
                alt=""
                className="size-full object-cover"
                style={{ imageRendering: 'pixelated' }}
              />
            )}
          </div>
          <div className="space-y-2 p-4">
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-tag-orange">
              Round {card.round} ·{' '}
              {card.round === 1 ? 'Surface' : card.round === 2 ? 'Undercurrent' : 'Horizon'}
            </span>
            <h3 className="font-syne text-base font-bold text-tag-text">
              {card.title}
            </h3>
            <p className="text-[12px] leading-relaxed text-tag-muted">
              {card.narrative}
            </p>
          </div>
        </div>
      ))}
    </div>

    <button
      type="button"
      onClick={onClose}
      className="mt-2 rounded-full bg-tag-orange px-6 py-3 font-mono text-xs uppercase tracking-[0.15em] text-tag-bg shadow-lg shadow-tag-orange/30 transition-colors hover:bg-tag-orange/90"
    >
      Seal it
    </button>
  </div>
)
