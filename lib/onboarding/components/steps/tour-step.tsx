'use client'

import { useEffect, useState } from 'react'
import Cal, { getCalApi } from '@calcom/embed-react'
import { Check, Compass, X } from 'lucide-react'

import { StepShell } from './step-shell'

interface TourStepProps {
  stepNumber: number
  totalSteps: number
  onBack?: () => void
  onNext: () => void
  onStepClick?: (step: number) => void
}

const extractCalLink = (url: string | undefined): string | null => {
  if (!url) return null
  try {
    const u = new URL(url)
    return u.pathname.replace(/^\/+|\/+$/g, '') || null
  } catch {
    return null
  }
}

export const TourStep = ({
  stepNumber,
  totalSteps,
  onBack,
  onNext,
  onStepClick,
}: TourStepProps) => {
  const calLink = extractCalLink(process.env.NEXT_PUBLIC_CAL_TOUR_URL)
  const [wantsTour, setWantsTour] = useState<boolean | null>(null)

  useEffect(() => {
    if (!calLink || wantsTour !== true) return
    ;(async () => {
      const cal = await getCalApi({ namespace: 'tour' })
      cal('ui', {
        hideEventTypeDetails: false,
        theme: 'dark',
        cssVarsPerTheme: {
          dark: { 'cal-brand': '#ff5f1f' },
          light: { 'cal-brand': '#ff5f1f' },
        },
      })
    })()
  }, [calLink, wantsTour])

  if (wantsTour !== true) {
    return (
      <StepShell
        stepNumber={stepNumber}
        totalSteps={totalSteps}
        title="Want a tour of the space?"
        subtitle="TAG is a physical place in Amsterdam. A community manager can show you around, introduce you to people working there, and answer anything you're curious about."
        onBack={onBack}
        onStepClick={onStepClick}
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setWantsTour(true)}
            className="group flex flex-col items-start gap-3 rounded-lg border border-tag-border bg-tag-card p-5 text-left transition-all hover:border-tag-orange/40 hover:bg-tag-orange/5"
          >
            <div className="flex size-10 items-center justify-center rounded-lg bg-tag-orange/10 text-tag-orange transition-colors group-hover:bg-tag-orange/20">
              <Check className="size-5" />
            </div>
            <div>
              <p className="font-syne text-base font-bold text-tag-text">Yes, I'd love one</p>
              <p className="mt-1 text-sm text-tag-muted">
                Pick a time on the next screen.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setWantsTour(false)
              onNext()
            }}
            className="group flex flex-col items-start gap-3 rounded-lg border border-tag-border bg-tag-card p-5 text-left transition-all hover:border-tag-border/80"
          >
            <div className="flex size-10 items-center justify-center rounded-lg bg-tag-text/5 text-tag-muted transition-colors group-hover:bg-tag-text/10">
              <X className="size-5" />
            </div>
            <div>
              <p className="font-syne text-base font-bold text-tag-text">Not now</p>
              <p className="mt-1 text-sm text-tag-muted">Skip for now.</p>
            </div>
          </button>
        </div>
      </StepShell>
    )
  }

  return (
    <StepShell
      stepNumber={stepNumber}
      totalSteps={totalSteps}
      title="Book your tour."
      subtitle="Pick a time that works — Pieter will see it and confirm."
      onBack={() => setWantsTour(null)}
      onNext={onNext}
      nextLabel="I booked it →"
      skipLabel="Skip for now"
      onSkip={onNext}
      onStepClick={onStepClick}
    >
      {calLink ? (
        <div className="overflow-hidden rounded-lg border border-tag-border bg-tag-card [&_iframe]:block">
          <div className="h-[620px] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <Cal
              namespace="tour"
              calLink={calLink}
              style={{ width: '100%', height: '100%' }}
              config={{ layout: 'month_view', theme: 'dark' }}
            />
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-tag-border bg-tag-card p-6 text-center">
          <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-tag-orange/10">
            <Compass className="size-5 text-tag-orange" />
          </div>
          <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-tag-dim">
            Booking link coming soon.
          </p>
        </div>
      )}
    </StepShell>
  )
}
