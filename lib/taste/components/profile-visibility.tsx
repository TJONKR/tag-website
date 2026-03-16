'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

import { cn } from '@lib/utils'

import type { BuilderProfile, VisibilityField } from '../types'

interface ProfileVisibilityProps {
  profile: BuilderProfile
  onUpdate: (field: VisibilityField, value: boolean) => Promise<void>
}

const VISIBILITY_OPTIONS: {
  field: VisibilityField
  label: string
}[] = [
  { field: 'show_headline', label: 'Headline' },
  { field: 'show_bio', label: 'Bio' },
  { field: 'show_tags', label: 'Tags' },
  { field: 'show_projects', label: 'Projects' },
  { field: 'show_interests', label: 'Interests' },
  { field: 'show_notable_work', label: 'Notable Work' },
  { field: 'show_influences', label: 'Influences' },
  { field: 'show_key_links', label: 'Links' },
]

export const ProfileVisibility = ({
  profile,
  onUpdate,
}: ProfileVisibilityProps) => {
  const [updating, setUpdating] = useState<VisibilityField | null>(null)

  const handleToggle = async (field: VisibilityField) => {
    setUpdating(field)
    try {
      await onUpdate(field, !profile[field])
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="rounded-xl border border-tag-border bg-tag-card p-6">
      <div className="mb-4">
        <h3 className="font-syne text-sm font-bold uppercase tracking-wider text-tag-text">
          Public Visibility
        </h3>
        <p className="mt-1 text-xs text-tag-dim">
          Control what appears on your public builder page.
        </p>
      </div>
      <div className="space-y-2">
        {VISIBILITY_OPTIONS.map(({ field, label }) => {
          const isVisible = profile[field]
          const isUpdating = updating === field
          return (
            <button
              key={field}
              onClick={() => handleToggle(field)}
              disabled={isUpdating}
              className={cn(
                'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
                isVisible
                  ? 'bg-tag-orange/5 text-tag-text'
                  : 'bg-transparent text-tag-dim'
              )}
            >
              <span>{label}</span>
              {isVisible ? (
                <Eye className="size-4 text-tag-orange" />
              ) : (
                <EyeOff className="size-4 text-tag-dim" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
