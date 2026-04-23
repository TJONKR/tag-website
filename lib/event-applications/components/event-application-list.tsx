'use client'

import { useCallback, useEffect, useState } from 'react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs'
import { Badge } from '@components/ui/badge'

import { EventApplicationDetailDialog } from './event-application-detail-dialog'

import type {
  EventApplicationCounts,
  EventApplicationStatus,
  EventHostApplication,
} from '../types'

interface EventApplicationListProps {
  initialApplications: EventHostApplication[]
  initialCounts: EventApplicationCounts
  initialSelectedId?: string | null
}

const statusColors: Record<EventApplicationStatus, string> = {
  pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  approved: 'bg-green-500/10 text-green-500 border-green-500/20',
  rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
  archived: 'bg-tag-border/40 text-tag-dim border-tag-border',
}

const TABS: EventApplicationStatus[] = ['pending', 'approved', 'rejected', 'archived']

export const EventApplicationList = ({
  initialApplications,
  initialCounts,
  initialSelectedId,
}: EventApplicationListProps) => {
  const [applications, setApplications] = useState(initialApplications)
  const [counts, setCounts] = useState(initialCounts)
  const [activeTab, setActiveTab] = useState<EventApplicationStatus>('pending')
  const [selected, setSelected] = useState<EventHostApplication | null>(null)

  const refresh = useCallback(async () => {
    try {
      const [appsRes, countsRes] = await Promise.all([
        fetch('/api/event-applications'),
        fetch('/api/event-applications?counts=true'),
      ])
      if (appsRes.ok) setApplications(await appsRes.json())
      if (countsRes.ok) setCounts(await countsRes.json())
    } catch {
      // Silent — existing data stays
    }
  }, [])

  // Deep-link to a specific application via ?id=<id>
  useEffect(() => {
    if (!initialSelectedId) return
    const found = applications.find((a) => a.id === initialSelectedId)
    if (found) {
      setActiveTab(found.status)
      setSelected(found)
    }
  }, [initialSelectedId, applications])

  const filtered = applications.filter((a) => a.status === activeTab)

  return (
    <div>
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as EventApplicationStatus)}
      >
        <TabsList className="border-tag-border bg-tag-card">
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="data-[state=active]:bg-tag-orange data-[state=active]:text-tag-bg-deep"
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)} ({counts[tab]})
            </TabsTrigger>
          ))}
        </TabsList>

        {TABS.map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-6">
            {filtered.length === 0 ? (
              <p className="py-12 text-center font-mono text-sm text-tag-dim">
                No {tab} requests.
              </p>
            ) : (
              <div className="space-y-3">
                {filtered.map((app) => (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => setSelected(app)}
                    className="flex w-full items-center justify-between rounded-lg border border-tag-border bg-tag-card p-4 text-left transition-colors hover:border-tag-orange/30"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-grotesk font-medium text-tag-text">
                          {app.event_title}
                        </span>
                        <Badge
                          variant="outline"
                          className={statusColors[app.status]}
                        >
                          {app.event_type}
                        </Badge>
                      </div>
                      <p className="mt-1 font-mono text-xs text-tag-dim">
                        {app.name} · {app.email}
                      </p>
                      <p className="mt-1 line-clamp-1 font-grotesk text-sm text-tag-muted">
                        {app.description}
                      </p>
                    </div>
                    <span className="ml-4 shrink-0 font-mono text-xs text-tag-dim">
                      {new Date(app.created_at).toLocaleDateString()}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <EventApplicationDetailDialog
        application={selected}
        onClose={() => setSelected(null)}
        onUpdated={refresh}
      />
    </div>
  )
}
