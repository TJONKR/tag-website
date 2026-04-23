'use client'

import { FadeIn } from '@lib/portal/components'
import { cn } from '@lib/utils'

interface StepShellProps {
  stepNumber: number
  totalSteps: number
  title: string
  subtitle?: string
  children: React.ReactNode
  onBack?: () => void
  onNext?: () => void
  onSkip?: () => void
  onStepClick?: (step: number) => void
  nextLabel?: string
  skipLabel?: string
  nextDisabled?: boolean
}

const pad = (n: number) => String(n).padStart(2, '0')

export const StepShell = ({
  stepNumber,
  totalSteps,
  title,
  subtitle,
  children,
  onBack,
  onNext,
  onSkip,
  onStepClick,
  nextLabel = 'Next →',
  skipLabel = 'Skip for now',
  nextDisabled = false,
}: StepShellProps) => {
  return (
    <div className="mx-auto w-full max-w-xl px-6 py-12">
      <FadeIn>
        <div className="mb-10 flex items-center gap-4">
          <div className="font-mono text-xs uppercase tracking-[0.18em]">
            <span className="text-tag-orange">{pad(stepNumber)}</span>
            <span className="text-tag-dim"> / {pad(totalSteps)}</span>
          </div>
          <div className="flex flex-1 items-center gap-2">
            {Array.from({ length: totalSteps }).map((_, i) => {
              const target = i + 1
              const isActive = target <= stepNumber
              const clickable = target < stepNumber && !!onStepClick
              return (
                <button
                  key={i}
                  type="button"
                  disabled={!clickable}
                  onClick={() => onStepClick?.(target)}
                  aria-label={clickable ? `Back to step ${target}` : undefined}
                  style={{ transitionDelay: `${i * 80}ms` }}
                  className={cn(
                    'h-1.5 flex-1 -skew-x-[20deg] transition-all duration-500 ease-out',
                    isActive ? 'bg-tag-orange' : 'bg-tag-border',
                    clickable
                      ? 'cursor-pointer hover:brightness-125'
                      : 'cursor-default'
                  )}
                />
              )
            })}
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={150}>
        <h1 className="font-syne text-3xl font-bold leading-tight text-tag-text">{title}</h1>
      </FadeIn>

      {subtitle && (
        <FadeIn delay={280}>
          <p className="mt-3 text-tag-muted">{subtitle}</p>
        </FadeIn>
      )}

      <FadeIn delay={420}>
        <div className="mt-10">{children}</div>
      </FadeIn>

      <FadeIn delay={600}>
        <div className="mt-12 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBack}
            disabled={!onBack}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md border border-tag-border px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors',
              onBack
                ? 'text-tag-muted hover:border-tag-orange/30 hover:text-tag-orange'
                : 'pointer-events-none text-tag-border/60'
            )}
          >
            ← Back
          </button>

          <div className="flex items-center gap-2">
            {onSkip && (
              <button
                type="button"
                onClick={onSkip}
                className="inline-flex items-center gap-1.5 rounded-md border border-tag-border px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-tag-muted transition-colors hover:border-tag-orange/30 hover:text-tag-orange"
              >
                {skipLabel}
              </button>
            )}
            {onNext && (
              <button
                type="button"
                onClick={onNext}
                disabled={nextDisabled}
                className="inline-flex items-center gap-1.5 rounded-md border border-tag-orange/30 bg-tag-orange/10 px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-tag-orange transition-colors hover:bg-tag-orange/20 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {nextLabel}
              </button>
            )}
          </div>
        </div>
      </FadeIn>
    </div>
  )
}
