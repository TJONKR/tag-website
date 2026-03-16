'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Gift, Loader2 } from 'lucide-react'

import { useBuilderProfile } from '../hooks'
import type { BuilderProfile } from '../types'

interface LootboxClientProps {
  userId: string
  fallbackProfile: BuilderProfile | null
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Initializing...',
  researching: 'Researching your profile...',
  formatting: 'Building your profile...',
  generating_skin: 'Generating your skin...',
}

export const LootboxClient = ({ userId, fallbackProfile }: LootboxClientProps) => {
  const { profile } = useBuilderProfile({ fallbackData: fallbackProfile })
  const [isTriggering, setIsTriggering] = useState(false)

  const isInProgress =
    profile &&
    profile.status !== 'complete' &&
    profile.status !== 'error' &&
    profile.status !== 'pending'

  const isComplete = profile?.status === 'complete'
  const hasSkin = !!profile?.skin_url

  async function handleOpen() {
    setIsTriggering(true)
    try {
      const res = await fetch('/api/taste/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      if (!res.ok) {
        const data = await res.json()
        console.error('[lootbox] Failed to start:', data)
      }
    } catch (err) {
      console.error('[lootbox] Error:', err)
    } finally {
      setIsTriggering(false)
    }
  }

  // Complete state — show skin + headline + tags
  if (isComplete && profile) {
    return (
      <div className="mt-4 flex items-start gap-4">
        {hasSkin && (
          <div className="relative size-20 shrink-0 overflow-hidden rounded-lg border border-tag-orange/30">
            <Image
              src={profile.skin_url!}
              alt="Your character skin"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        )}
        <div className="flex-1">
          {profile.headline && (
            <p className="font-syne text-sm font-bold text-tag-text">
              {profile.headline}
            </p>
          )}
          {profile.tags && profile.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {profile.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-tag-orange/30 bg-tag-orange/5 px-2.5 py-0.5 text-[11px] text-tag-orange"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // In-progress state — compact progress
  if (isInProgress || isTriggering) {
    const statusLabel =
      STATUS_LABELS[profile?.status ?? 'pending'] ?? 'Processing...'
    const statusMessage = profile?.status_message ?? statusLabel

    return (
      <div className="mt-4">
        <div className="flex items-center gap-3">
          <Loader2 className="size-5 animate-spin text-tag-orange" />
          <div className="flex-1">
            <p className="font-syne text-sm font-bold text-tag-text">
              Building your profile...
            </p>
            <p className="mt-0.5 text-xs text-tag-muted">{statusMessage}</p>
          </div>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-tag-border">
          <div
            className="h-full rounded-full bg-gradient-to-r from-tag-orange to-amber-400 transition-all duration-1000 ease-out"
            style={{
              width: `${
                profile?.status === 'researching'
                  ? 40
                  : profile?.status === 'formatting'
                    ? 80
                    : profile?.status === 'generating_skin'
                      ? 95
                      : 10
              }%`,
            }}
          />
        </div>
      </div>
    )
  }

  // Ready state — "Open Lootbox" button
  return (
    <div className="mt-4 flex items-center gap-4">
      <div className="flex size-10 items-center justify-center rounded-lg bg-tag-orange/10">
        <Gift className="size-5 text-tag-orange" />
      </div>
      <div className="flex-1">
        <p className="font-syne text-sm font-bold text-tag-text">
          Your lootbox is ready!
        </p>
        <p className="mt-0.5 text-xs text-tag-muted">
          You completed your profile. Claim your reward.
        </p>
      </div>
      <button
        onClick={handleOpen}
        disabled={isTriggering}
        className="rounded-lg bg-tag-orange px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-tag-bg transition-colors hover:bg-tag-orange/90 disabled:opacity-50"
      >
        Open Lootbox
      </button>
    </div>
  )
}
