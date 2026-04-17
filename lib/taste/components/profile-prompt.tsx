'use client'

import { Sparkles, CheckCircle2, XCircle } from 'lucide-react'

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
}

const DATA_SOURCES = [
  { key: 'twitter_url' as const, label: 'Twitter / X', required: true },
  { key: 'linkedin_url' as const, label: 'LinkedIn', required: true },
  { key: 'github_url' as const, label: 'GitHub', required: false },
  { key: 'website_url' as const, label: 'Website', required: false },
]

export const ProfilePrompt = ({ profile }: ProfilePromptProps) => {
  const hasName = !!profile.name
  const hasTwitter = !!profile.twitter_url
  const hasLinkedIn = !!profile.linkedin_url
  const canAutoRun = hasName && (hasTwitter || hasLinkedIn)

  const filledCount = DATA_SOURCES.filter((u) => !!profile[u.key]).length

  return (
    <div className="rounded-xl border border-tag-border bg-tag-card p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-tag-orange/10">
          <Sparkles className="size-5 text-tag-orange" />
        </div>
        <div>
          <h2 className="font-syne text-xl font-bold text-tag-text">
            Your Builder Profile
          </h2>
          <p className="text-sm text-tag-muted">
            AI-enriched profile from your digital presence
          </p>
        </div>
      </div>

      <p className="mb-6 text-tag-muted">
        We research your public digital presence — tweets, posts, website, and
        projects — to build a rich builder profile. It runs automatically once
        you complete onboarding with at least a name and a Twitter or LinkedIn
        URL.
      </p>

      <div className="mb-6 space-y-2">
        <p className="font-mono text-xs uppercase tracking-wider text-tag-dim">
          Data sources ({filledCount}/{DATA_SOURCES.length})
        </p>
        {DATA_SOURCES.map((url) => {
          const filled = !!profile[url.key]
          return (
            <div key={url.key} className="flex items-center gap-2 text-sm">
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
              <span className={cn(filled ? 'text-tag-text' : 'text-tag-muted')}>
                {url.label}
              </span>
              {!filled && url.required && (
                <span className="font-mono text-xs text-tag-orange">
                  NEEDS AT LEAST ONE
                </span>
              )}
              {!filled && !url.required && (
                <span className="font-mono text-xs text-tag-dim">OPTIONAL</span>
              )}
            </div>
          )
        })}
      </div>

      {!canAutoRun ? (
        <p className="text-sm text-tag-orange">
          Add your name and at least a Twitter or LinkedIn URL in your{' '}
          <a href="/portal/profile" className="underline">
            profile
          </a>{' '}
          — your builder profile will be generated automatically.
        </p>
      ) : (
        <p className="text-sm text-tag-muted">
          Your builder profile hasn&apos;t been generated yet. If it doesn&apos;t
          appear soon, reach out to an admin.
        </p>
      )}
    </div>
  )
}
