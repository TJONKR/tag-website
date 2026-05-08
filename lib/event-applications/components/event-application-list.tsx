'use client'

import { useCallback, useEffect, useState } from 'react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs'
import { formatDateDisplay } from '@lib/events/types'

import { EventApplicationDetailSheet } from './event-application-detail-sheet'

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

// Same pill style as the Luma badge in portal-event-list (rounded, mono,
// tiny uppercase) with a different color per status.
const statusPillClasses: Record<EventApplicationStatus, string> = {
  pending: 'bg-yellow-500/10 text-yellow-500',
  approved: 'bg-green-500/10 text-green-500',
  rejected: 'bg-red-500/10 text-red-500',
  archived: 'bg-tag-dim/10 text-tag-muted',
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
              <div>
                {filtered.map((app) => {
                  const displayDate = app.proposed_date ?? app.created_at
                  return (
                    <div
                      key={app.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelected(app)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          setSelected(app)
                        }
                      }}
                      className="flex cursor-pointer flex-col gap-2 border-t border-tag-border px-4 py-4 transition-all duration-300 hover:border-l-2 hover:border-l-tag-orange"
                    >
                      <div className="font-mono text-sm font-bold text-tag-orange">
                        {formatDateDisplay(displayDate)}
                      </div>
                      <span className="font-syne text-base text-tag-text">
                        {app.event_title}
                      </span>
                      <span className="font-mono text-xs text-tag-muted">
                        {app.name}
                        {app.organization ? ` · ${app.organization}` : ''}
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider ${statusPillClasses[app.status]}`}
                        >
                          {app.status}
                        </span>
                        <span className="font-mono text-xs uppercase tracking-wider text-tag-dim">
                          {app.event_type}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <EventApplicationDetailSheet
        application={selected}
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
        onUpdated={refresh}
      />
    </div>
  )
}
