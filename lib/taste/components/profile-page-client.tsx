'use client'

import { useBuilderProfile } from '../hooks'
import type { VisibilityField } from '../types'
import { ProfilePrompt } from './profile-prompt'
import { ProfileProgress } from './profile-progress'
import { ProfileCard } from './profile-card'
import { ProfileVisibility } from './profile-visibility'

interface ProfileData {
  name: string | null
  twitter_url: string | null
  linkedin_url: string | null
  github_url: string | null
  website_url: string | null
}

interface ProfilePageClientProps {
  userId: string
  profile: ProfileData
}

export const ProfilePageClient = ({
  userId: _userId,
  profile,
}: ProfilePageClientProps) => {
  const { profile: builderProfile, mutate } = useBuilderProfile()

  const handleVisibilityUpdate = async (
    field: VisibilityField,
    value: boolean
  ) => {
    try {
      const res = await fetch('/api/taste/visibility', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field, value }),
      })

      if (res.ok) {
        mutate()
      }
    } catch {
      // Silent fail — SWR will re-fetch
    }
  }

  // No profile yet or error — show prompt (no user-triggerable action;
  // auto-generation runs once after onboarding completion).
  if (!builderProfile || builderProfile.status === 'error') {
    return (
      <div className="space-y-4">
        <ProfilePrompt profile={profile} />
        {builderProfile?.status === 'error' && builderProfile.error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
            <p className="text-sm text-red-400">
              Previous attempt failed: {builderProfile.error}
            </p>
            <p className="mt-1 text-xs text-tag-dim">
              An admin can retry this for you — reach out in the space.
            </p>
          </div>
        )}
      </div>
    )
  }

  // In progress
  if (builderProfile.status !== 'complete') {
    return (
      <ProfileProgress
        status={builderProfile.status}
        statusMessage={builderProfile.status_message}
      />
    )
  }

  // Complete — show profile card + visibility controls
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <ProfileCard profile={builderProfile} />
      <div className="lg:sticky lg:top-6 lg:self-start">
        <ProfileVisibility
          profile={builderProfile}
          onUpdate={handleVisibilityUpdate}
        />
      </div>
    </div>
  )
}
