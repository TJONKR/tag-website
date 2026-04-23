'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import useSWR from 'swr'
import { Loader2, Sparkles } from 'lucide-react'

import { toast } from '@components/toast'
import { ProphecyReveal } from '@lib/taste/components'
import type { BuilderProfile, ProphecyCard } from '@lib/taste/types'

import { StepShell } from './step-shell'

interface ProphecyStepProps {
  stepNumber: number
  totalSteps: number
  onBack?: () => void
  onNext: () => void
  onStepClick?: (step: number) => void
}

const fetcher = (url: string) => fetch(url).then((r) => (r.ok ? r.json() : null))

export const ProphecyStep = ({
  stepNumber,
  totalSteps,
  onBack,
  onNext,
  onStepClick,
}: ProphecyStepProps) => {
  const { data, mutate } = useSWR<BuilderProfile | null>('/api/taste/status', fetcher, {
    refreshInterval: (latest) => (latest?.status === 'complete' ? 0 : 4000),
    revalidateOnFocus: false,
  })
  const [drawing, setDrawing] = useState(false)
  const [revealOpen, setRevealOpen] = useState(false)

  const status = data?.status ?? null
  const isComplete = status === 'complete'
  const isError = status === 'error'
  const prophecyRounds = data?.prophecy_rounds ?? null
  const prophecyChosen: ProphecyCard[] | null = data?.prophecy_chosen ?? null
  const hasUnsealedRounds = useMemo(() => {
    if (!prophecyRounds || prophecyRounds.length === 0) return false
    return !prophecyChosen
  }, [prophecyRounds, prophecyChosen])

  const handleDraw = useCallback(async () => {
    setDrawing(true)
    try {
      const res = await fetch('/api/taste/prophecy/draw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        toast({
          type: 'error',
          description: json.errors?.[0]?.message ?? 'Could not start the draw.',
        })
        return
      }
      await mutate()
      setRevealOpen(true)
    } catch {
      toast({ type: 'error', description: 'Could not start the draw.' })
    } finally {
      setDrawing(false)
    }
  }, [mutate])

  const handleFinalized = useCallback(async () => {
    setRevealOpen(false)
    await mutate()
  }, [mutate])

  // If rounds are already sealed (finalized) and user comes back to this
  // step, they should just be able to continue.
  useEffect(() => {
    // no-op placeholder — future hook point if we want auto-advance
  }, [prophecyChosen])

  return (
    <StepShell
      stepNumber={stepNumber}
      totalSteps={totalSteps}
      title="Your Prophecy."
      subtitle="A tarot-style reading of where your work is headed. Pick one card per round — three rounds total — and they become your forward-looking statement."
      onBack={onBack}
      onNext={prophecyChosen ? onNext : undefined}
      nextLabel="Continue →"
      onSkip={onNext}
      skipLabel={prophecyChosen ? 'Skip for now' : 'Skip for now'}
      onStepClick={onStepClick}
    >
      <div className="rounded-lg border border-tag-border bg-tag-card p-8">
        {!isComplete && !isError && (
          <div className="flex flex-col items-center gap-4 text-center">
            <Loader2 className="size-8 animate-spin text-tag-orange" />
            <div>
              <p className="font-syne text-lg text-tag-text">Reading about you...</p>
              <p className="mt-2 text-sm text-tag-muted">
                We're studying the signals from your socials. This usually takes a minute or two.
              </p>
            </div>
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex size-12 items-center justify-center rounded-full border border-destructive/40 text-destructive">
              !
            </div>
            <p className="text-sm text-tag-muted">
              We couldn't prepare your Prophecy right now. You can continue and try again later
              from your profile.
            </p>
          </div>
        )}

        {isComplete && !prophecyChosen && (
          <div className="flex flex-col items-center gap-5 text-center">
            <div className="flex size-14 items-center justify-center rounded-full border border-tag-orange/30 bg-tag-bg">
              <Sparkles className="size-6 text-tag-orange" />
            </div>
            <div>
              <p className="font-syne text-lg text-tag-text">The cards are ready.</p>
              <p className="mt-2 text-sm text-tag-muted">
                {hasUnsealedRounds ? 'Resume where you left off.' : 'Three rounds. One pick each.'}
              </p>
            </div>
            <button
              type="button"
              onClick={hasUnsealedRounds ? () => setRevealOpen(true) : handleDraw}
              disabled={drawing}
              className="inline-flex items-center gap-2 rounded-md border border-tag-orange/30 bg-tag-orange/10 px-4 py-2.5 font-mono text-xs uppercase tracking-wider text-tag-orange transition-colors hover:bg-tag-orange/20 disabled:opacity-50"
            >
              {drawing ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Dealing cards...
                </>
              ) : hasUnsealedRounds ? (
                'Resume the draw →'
              ) : (
                'Begin the draw →'
              )}
            </button>
          </div>
        )}

        {isComplete && prophecyChosen && prophecyChosen.length === 3 && (
          <div className="space-y-4">
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-tag-dim">
              Your Prophecy
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {prophecyChosen.map((card) => (
                <div
                  key={card.id}
                  className="overflow-hidden rounded-lg border border-tag-border bg-tag-bg"
                >
                  {card.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={card.image_url}
                      alt={card.title}
                      className="aspect-square w-full object-cover"
                    />
                  )}
                  <div className="p-3">
                    <p className="font-syne text-sm font-bold text-tag-text">{card.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-tag-muted">{card.narrative}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <ProphecyReveal
        open={revealOpen}
        onOpenChange={setRevealOpen}
        initialRounds={prophecyRounds ?? null}
        onFinalized={handleFinalized}
      />
    </StepShell>
  )
}
