import { Check, Gift } from 'lucide-react'

import { cn } from '@lib/utils'

interface LootboxStep {
  label: string
  done: boolean
}

interface LootboxProgressProps {
  steps: LootboxStep[]
}

const RING_SIZE = 56
const STROKE_WIDTH = 3
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export const LootboxProgress = ({ steps }: LootboxProgressProps) => {
  const completed = steps.filter((s) => s.done).length
  const total = steps.length
  const percent = Math.round((completed / total) * 100)
  const allDone = completed === total
  const offset = CIRCUMFERENCE - (percent / 100) * CIRCUMFERENCE

  if (allDone) return null

  return (
    <div className="rounded-lg border border-tag-border bg-tag-card p-5">
      <div className="flex flex-col items-center text-center">
        <div className="relative flex items-center justify-center">
          <svg
            width={RING_SIZE}
            height={RING_SIZE}
            className="-rotate-90"
          >
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke="currentColor"
              strokeWidth={STROKE_WIDTH}
              className="text-tag-border"
            />
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke="url(#progress-gradient)"
              strokeWidth={STROKE_WIDTH}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={offset}
              className="transition-all duration-700 ease-out"
            />
            <defs>
              <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#fb923c" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute flex items-center justify-center">
            <Gift className="size-5 text-tag-orange" />
          </div>
        </div>
        <p className="mt-4 font-syne text-sm font-bold text-tag-text">
          {percent < 80 ? 'Unlock your lootbox' : 'Almost there'}
        </p>
        <p className="mt-1 text-sm text-tag-muted">
          Complete your profile to earn your first collectible card.
        </p>
      </div>

      {/* Steps */}
      <div className="mt-5 space-y-2">
        {steps.map((step) => (
          <div key={step.label} className="flex items-center gap-2.5">
            <div
              className={cn(
                'flex size-4 shrink-0 items-center justify-center rounded-full',
                step.done ? 'bg-tag-orange' : 'border border-tag-border'
              )}
            >
              {step.done && <Check className="size-2.5 text-white" />}
            </div>
            <span
              className={cn(
                'text-sm',
                step.done ? 'text-tag-muted line-through' : 'text-tag-text'
              )}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
