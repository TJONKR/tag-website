'use client'

import { Sparkles } from 'lucide-react'

import { StepShell } from './step-shell'

interface ProphecyStepProps {
  stepNumber: number
  totalSteps: number
  onBack?: () => void
  onNext: () => void
  onStepClick?: (step: number) => void
}

export const ProphecyStep = ({
  stepNumber,
  totalSteps,
  onBack,
  onNext,
  onStepClick,
}: ProphecyStepProps) => {
  return (
    <StepShell
      stepNumber={stepNumber}
      totalSteps={totalSteps}
      title="Your Prophecy."
      subtitle="Soon: a tarot-style reading of where your work is headed — drawn fresh from what you're building."
      onBack={onBack}
      onNext={onNext}
      nextLabel="Continue →"
      onStepClick={onStepClick}
    >
      <div className="flex flex-col items-center gap-5 rounded-lg border border-dashed border-tag-orange/30 bg-tag-orange/5 px-6 py-12 text-center">
        <div className="flex size-14 items-center justify-center rounded-full border border-tag-orange/30 bg-tag-card">
          <Sparkles className="size-6 text-tag-orange" />
        </div>
        <div>
          <p className="font-syne text-lg text-tag-text">Your Prophecy is being prepared.</p>
          <p className="mt-2 font-mono text-xs uppercase tracking-[0.14em] text-tag-dim">
            Coming soon
          </p>
        </div>
      </div>
    </StepShell>
  )
}
