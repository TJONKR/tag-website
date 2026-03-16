import { Check, Gift } from 'lucide-react'

import { cn } from '@lib/utils'

interface LootboxStep {
  label: string
  done: boolean
}

interface LootboxProgressProps {
  steps: LootboxStep[]
}

export const LootboxProgress = ({ steps }: LootboxProgressProps) => {
  const completed = steps.filter((s) => s.done).length
  const total = steps.length
  const percent = Math.round((completed / total) * 100)
  const allDone = completed === total

  if (allDone) return null

  return (
    <div className="rounded-lg border border-tag-orange/30 bg-gradient-to-r from-tag-orange/5 to-transparent p-5">
      <div className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-tag-orange/10">
          <Gift className="size-5 text-tag-orange" />
        </div>
        <div className="flex-1">
          <p className="font-syne text-sm font-bold text-tag-text">
            {percent < 50
              ? 'Complete your profile for your first lootbox'
              : percent < 100
                ? 'Almost there — your lootbox is waiting'
                : 'Lootbox unlocked!'}
          </p>
          <p className="mt-0.5 font-mono text-[11px] text-tag-muted">
            {completed}/{total} completed
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-tag-border">
        <div
          className="h-full rounded-full bg-gradient-to-r from-tag-orange to-amber-400 transition-all duration-700 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Steps */}
      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1.5">
        {steps.map((step) => (
          <div key={step.label} className="flex items-center gap-2">
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
                'text-xs',
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
