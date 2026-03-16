'use client'

import { useState } from 'react'
import { Sparkles, CheckCircle2, XCircle, Loader2 } from 'lucide-react'

import { Button } from '@components/ui/button'
import { cn } from '@lib/utils'

interface ProfileData {
  name: string | null
  twitter_url: string | null
  linkedin_url: string | null
  github_url: string | null
  website_url: string | null
}

interface ProfilePromptProps {
  profile: ProfileData
  onTrigger: () => void
}

const DATA_SOURCES = [
  { key: 'twitter_url' as const, label: 'Twitter / X', required: true },
  { key: 'linkedin_url' as const, label: 'LinkedIn', required: true },
  { key: 'github_url' as const, label: 'GitHub', required: false },
  { key: 'website_url' as const, label: 'Website', required: false },
]

export const ProfilePrompt = ({ profile, onTrigger }: ProfilePromptProps) => {
  const [loading, setLoading] = useState(false)

  const hasName = !!profile.name
  const hasTwitter = !!profile.twitter_url
  const hasLinkedIn = !!profile.linkedin_url
  const canTrigger = hasName && (hasTwitter || hasLinkedIn)

  const filledCount = DATA_SOURCES.filter((u) => !!profile[u.key]).length

  const handleTrigger = async () => {
    setLoading(true)
    onTrigger()
  }

  return (
    <div className="rounded-xl border border-tag-border bg-tag-card p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-tag-orange/10">
          <Sparkles className="size-5 text-tag-orange" />
        </div>
        <div>
          <h2 className="font-syne text-xl font-bold text-tag-text">
            Build Your Profile
          </h2>
          <p className="text-sm text-tag-muted">
            AI-powered profile enrichment from your digital presence
          </p>
        </div>
      </div>

      <p className="mb-6 text-tag-muted">
        We&apos;ll research your public digital presence — tweets, posts,
        website, and projects — to build a rich builder profile. You stay in
        control of what&apos;s shown publicly.
      </p>

      <div className="mb-6 space-y-2">
        <p className="font-mono text-xs uppercase tracking-wider text-tag-dim">
          Data sources ({filledCount}/{DATA_SOURCES.length})
        </p>
        {DATA_SOURCES.map((url) => {
          const filled = !!profile[url.key]
          return (
            <div
              key={url.key}
              className="flex items-center gap-2 text-sm"
            >
              {filled ? (
                <CheckCircle2 className="size-4 text-green-500" />
              ) : (
                <XCircle
                  className={cn(
                    'size-4',
                    url.required ? 'text-tag-orange' : 'text-tag-dim'
                  )}
                />
              )}
              <span
                className={cn(
                  filled ? 'text-tag-text' : 'text-tag-muted'
                )}
              >
                {url.label}
              </span>
              {!filled && url.required && (
                <span className="font-mono text-[10px] text-tag-orange">
                  NEEDS AT LEAST ONE
                </span>
              )}
              {!filled && !url.required && (
                <span className="font-mono text-[10px] text-tag-dim">
                  OPTIONAL
                </span>
              )}
            </div>
          )
        })}
      </div>

      {!canTrigger && (
        <p className="mb-4 text-sm text-tag-orange">
          Add your name and at least a Twitter or LinkedIn URL in your{' '}
          <a href="/portal/profile" className="underline">
            profile
          </a>{' '}
          to build your profile.
        </p>
      )}

      <Button
        onClick={handleTrigger}
        disabled={!canTrigger || loading}
        className="w-full bg-tag-orange font-mono text-sm uppercase tracking-wider text-white hover:bg-tag-orange/90 disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Starting...
          </>
        ) : (
          'Build My Profile'
        )}
      </Button>
    </div>
  )
}
