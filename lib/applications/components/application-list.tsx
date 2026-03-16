'use client'

import { useState, useCallback } from 'react'
import { Check, X, Loader2, Mail, Send } from 'lucide-react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs'
import { Badge } from '@components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog'
import { toast } from '@components/toast'

import type { Application, ApplicationStatus, ApplicationCounts } from '../types'

interface ApplicationListProps {
  initialApplications: Application[]
  initialCounts: ApplicationCounts
}

const statusColors: Record<ApplicationStatus, string> = {
  pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  accepted: 'bg-green-500/10 text-green-500 border-green-500/20',
  rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
}

export const ApplicationList = ({
  initialApplications,
  initialCounts,
}: ApplicationListProps) => {
  const [applications, setApplications] = useState(initialApplications)
  const [counts, setCounts] = useState(initialCounts)
  const [activeTab, setActiveTab] = useState<ApplicationStatus>('pending')
  const [loading, setLoading] = useState<string | null>(null)
  const [selected, setSelected] = useState<Application | null>(null)

  const filtered = applications.filter((a) => a.status === activeTab)

  const fetchApplications = useCallback(async () => {
    try {
      const [appsRes, countsRes] = await Promise.all([
        fetch('/api/applications'),
        fetch('/api/applications?counts=true'),
      ])
      if (appsRes.ok) setApplications(await appsRes.json())
      if (countsRes.ok) setCounts(await countsRes.json())
    } catch {
      // Silently fail — existing data stays
    }
  }, [])

  const handleAction = async (id: string, status: 'accepted' | 'rejected') => {
    setLoading(id)
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.errors?.[0]?.message || 'Failed')
      }

      toast({
        type: 'success',
        description: status === 'accepted' ? 'Application accepted — invite sent.' : 'Application rejected.',
      })

      setSelected(null)
      await fetchApplications()
    } catch (error) {
      toast({
        type: 'error',
        description: error instanceof Error ? error.message : 'Something went wrong.',
      })
    } finally {
      setLoading(null)
    }
  }

  return (
    <div>
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as ApplicationStatus)}
      >
        <TabsList className="border-tag-border bg-tag-card">
          <TabsTrigger
            value="pending"
            className="data-[state=active]:bg-tag-orange data-[state=active]:text-tag-bg-deep"
          >
            Pending ({counts.pending})
          </TabsTrigger>
          <TabsTrigger
            value="accepted"
            className="data-[state=active]:bg-tag-orange data-[state=active]:text-tag-bg-deep"
          >
            Accepted ({counts.accepted})
          </TabsTrigger>
          <TabsTrigger
            value="rejected"
            className="data-[state=active]:bg-tag-orange data-[state=active]:text-tag-bg-deep"
          >
            Rejected ({counts.rejected})
          </TabsTrigger>
        </TabsList>

        {(['pending', 'accepted', 'rejected'] as const).map((status) => (
          <TabsContent key={status} value={status} className="mt-6">
            {filtered.length === 0 ? (
              <p className="py-12 text-center font-mono text-sm text-tag-dim">
                No {status} applications.
              </p>
            ) : (
              <div className="space-y-3">
                {filtered.map((app) => (
                  <div
                    key={app.id}
                    className="flex cursor-pointer items-center justify-between rounded-lg border border-tag-border bg-tag-card p-4 transition-colors hover:border-tag-orange/30"
                    onClick={() => setSelected(app)}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-grotesk font-medium text-tag-text">
                          {app.name}
                        </span>
                        <Badge
                          variant="outline"
                          className={statusColors[app.status]}
                        >
                          {app.status}
                        </Badge>
                      </div>
                      <p className="mt-1 font-mono text-xs text-tag-dim">
                        {app.email}
                      </p>
                      <p className="mt-1 line-clamp-1 font-grotesk text-sm text-tag-muted">
                        {app.building}
                      </p>
                    </div>
                    <span className="ml-4 shrink-0 font-mono text-xs text-tag-dim">
                      {new Date(app.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-h-[80vh] overflow-y-auto border-tag-border bg-tag-bg text-tag-text">
          <DialogHeader>
            <DialogTitle className="font-syne text-xl">
              {selected?.name}
            </DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Mail className="size-4 text-tag-dim" />
                <span className="font-mono text-sm text-tag-muted">
                  {selected.email}
                </span>
                <Badge
                  variant="outline"
                  className={statusColors[selected.status]}
                >
                  {selected.status}
                </Badge>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-tag-dim">
                    Building
                  </p>
                  <p className="mt-1 font-grotesk text-sm text-tag-text">
                    {selected.building}
                  </p>
                </div>

                <div>
                  <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-tag-dim">
                    Why TAG
                  </p>
                  <p className="mt-1 font-grotesk text-sm text-tag-text">
                    {selected.why_tag}
                  </p>
                </div>

                {selected.referral && (
                  <div>
                    <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-tag-dim">
                      Referral
                    </p>
                    <p className="mt-1 font-grotesk text-sm text-tag-text">
                      {selected.referral}
                    </p>
                  </div>
                )}

                {/* Socials */}
                {(selected.linkedin_url ||
                  selected.twitter_url ||
                  selected.github_url ||
                  selected.website_url ||
                  selected.instagram_url) && (
                  <div>
                    <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-tag-dim">
                      Socials
                    </p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {selected.linkedin_url && (
                        <a
                          href={selected.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-xs text-tag-orange hover:underline"
                        >
                          LinkedIn
                        </a>
                      )}
                      {selected.twitter_url && (
                        <a
                          href={selected.twitter_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-xs text-tag-orange hover:underline"
                        >
                          Twitter
                        </a>
                      )}
                      {selected.github_url && (
                        <a
                          href={selected.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-xs text-tag-orange hover:underline"
                        >
                          GitHub
                        </a>
                      )}
                      {selected.website_url && (
                        <a
                          href={selected.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-xs text-tag-orange hover:underline"
                        >
                          Website
                        </a>
                      )}
                      {selected.instagram_url && (
                        <a
                          href={selected.instagram_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-xs text-tag-orange hover:underline"
                        >
                          Instagram
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <p className="font-mono text-xs text-tag-dim">
                Applied {new Date(selected.created_at).toLocaleDateString()}
                {selected.reviewed_at &&
                  ` — Reviewed ${new Date(selected.reviewed_at).toLocaleDateString()}`}
              </p>

              {/* Actions */}
              {selected.status === 'pending' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleAction(selected.id, 'accepted')}
                    disabled={loading === selected.id}
                    className="flex items-center gap-2 bg-green-600 px-6 py-2.5 font-grotesk font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading === selected.id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Check className="size-4" />
                    )}
                    Accept & Invite
                  </button>
                  <button
                    onClick={() => handleAction(selected.id, 'rejected')}
                    disabled={loading === selected.id}
                    className="flex items-center gap-2 border border-red-500/30 px-6 py-2.5 font-grotesk font-medium text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50"
                  >
                    <X className="size-4" />
                    Reject
                  </button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
