import { cn } from '@lib/utils'

import type { TierMeta } from '../tiers'

interface TierBadgeProps {
  tier: TierMeta
}

const TIER_COLORS: Record<TierMeta['key'], string> = {
  arrived: 'border-tag-border text-tag-muted',
  sparked: 'border-amber-300/40 text-amber-200',
  prophecy: 'border-tag-orange/50 text-tag-orange',
  embodied: 'border-violet-300/40 text-violet-200',
  present: 'border-emerald-300/40 text-emerald-200',
}

export const TierBadge = ({ tier }: TierBadgeProps) => {
  const color = TIER_COLORS[tier.key]
  const totalSteps = 5

  return (
    <div className="rounded-lg border border-tag-border bg-tag-card p-4">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-tag-dim">
          tier {tier.index}/{totalSteps}
        </span>
        <span
          className={cn(
            'rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.15em]',
            color
          )}
        >
          {tier.label}
        </span>
      </div>
      <p className="mt-2 font-syne text-sm font-semibold text-tag-text">
        {tier.tagline}
      </p>
      {tier.nextStep && (
        <p className="mt-1 text-[11px] leading-relaxed text-tag-muted">
          Next: {tier.nextStep}
        </p>
      )}
      <div className="mt-3 flex gap-1">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors',
              i < tier.index ? 'bg-tag-orange' : 'bg-tag-border'
            )}
          />
        ))}
      </div>
    </div>
  )
}
