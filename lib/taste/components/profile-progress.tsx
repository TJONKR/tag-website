'use client'

import { Loader2 } from 'lucide-react'

import type { ProfileStatus } from '../types'

interface ProfileProgressProps {
  status: ProfileStatus
  statusMessage: string | null
}

const STATUS_CONFIG: Record<
  string,
  { label: string; description: string; progress: number }
> = {
  pending: {
    label: 'Initializing',
    description: 'Setting up the research pipeline...',
    progress: 5,
  },
  researching: {
    label: 'Researching',
    description: 'Scraping profiles, searching the web, building your dossier...',
    progress: 40,
  },
  formatting: {
    label: 'Building Profile',
    description: 'Extracting your headline, bio, projects, and more...',
    progress: 80,
  },
  generating_skin: {
    label: 'Generating Skin',
    description: 'Creating your character...',
    progress: 95,
  },
}

export const ProfileProgress = ({
  status,
  statusMessage,
}: ProfileProgressProps) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending

  return (
    <div className="rounded-xl border border-tag-border bg-tag-card p-8">
      <div className="mb-6 flex items-center gap-3">
        <Loader2 className="size-6 animate-spin text-tag-orange" />
        <div>
          <h2 className="font-syne text-xl font-bold text-tag-text">
            {config.label}
          </h2>
          <p className="text-sm text-tag-muted">{config.description}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-tag-border">
        <div
          className="h-full rounded-full bg-tag-orange transition-all duration-1000 ease-out"
          style={{ width: `${config.progress}%` }}
        />
      </div>

      {statusMessage && (
        <p className="font-mono text-xs text-tag-muted">{statusMessage}</p>
      )}

      <p className="mt-6 text-center text-sm text-tag-dim">
        This usually takes 1-2 minutes. You can leave this page and come back.
      </p>
    </div>
  )
}
