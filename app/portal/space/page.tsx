'use client'

import { useState } from 'react'
import { Coffee, Users, Wifi } from 'lucide-react'
import Link from 'next/link'

import { PortalHeader, InfoCard, FloorPlanMap } from '@lib/portal/components'
import { facilities, openingHours } from '@lib/portal/data'
import { cn } from '@lib/utils'

const tabs = [
  { key: 'floor-plan', label: 'Floor Plan' },
  { key: 'facilities', label: 'Facilities' },
  { key: 'hours', label: 'Opening Hours' },
] as const

type Tab = (typeof tabs)[number]['key']

const facilityIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  wifi: Wifi,
  users: Users,
  coffee: Coffee,
}

export default function SpacePage() {
  const [activeTab, setActiveTab] = useState<Tab>('floor-plan')

  return (
    <>
      <PortalHeader
        title="Space"
        description="Everything about the TAG workspace — floor plan, facilities and opening hours."
      />

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-lg border border-tag-border bg-tag-card p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'flex-1 rounded-md px-3 py-2 font-mono text-xs uppercase tracking-[0.1em] transition-colors',
              activeTab === tab.key
                ? 'bg-tag-orange/10 text-tag-orange'
                : 'text-tag-muted hover:text-tag-text'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Floor Plan */}
      {activeTab === 'floor-plan' && <FloorPlanMap />}

      {/* Facilities */}
      {activeTab === 'facilities' && (
        <div className="grid gap-4">
          {facilities.map((facility) => {
            const Icon = facilityIconMap[facility.icon]
            return (
              <InfoCard
                key={facility.name}
                title={facility.name}
                description={facility.description}
                icon={Icon ? <Icon className="size-4" /> : undefined}
              />
            )
          })}
        </div>
      )}

      {/* Opening Hours */}
      {activeTab === 'hours' && (
        <>
          <div className="rounded-lg border border-tag-border bg-tag-card">
            <div className="flex items-center border-b border-tag-border px-5 py-3">
              <span className="flex-1 text-xs font-medium uppercase tracking-wide text-tag-dim" />
              <span className="w-36 text-right text-xs font-medium uppercase tracking-wide text-tag-dim">
                TAG
              </span>
              <span className="w-36 text-right text-xs font-medium uppercase tracking-wide text-tag-dim">
                The Hubb
              </span>
            </div>
            {openingHours.map((entry, i) => (
              <div
                key={entry.day}
                className={cn(
                  'flex items-center px-5 py-4',
                  i !== openingHours.length - 1 && 'border-b border-tag-border'
                )}
              >
                <div className="flex-1">
                  <span className="font-medium text-tag-text">{entry.day}</span>
                  {entry.note && (
                    <p className="mt-0.5 text-xs text-tag-muted">{entry.note}</p>
                  )}
                </div>
                <span
                  className={cn(
                    'w-36 text-right font-mono text-sm',
                    entry.hours === 'Closed' ? 'text-tag-dim' : 'text-tag-orange'
                  )}
                >
                  {entry.hours}
                </span>
                <span
                  className={cn(
                    'w-36 text-right font-mono text-sm',
                    entry.building === 'Closed' ? 'text-tag-dim' : 'text-tag-muted'
                  )}
                >
                  {entry.building}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-lg border border-tag-border bg-tag-card p-5">
            <h3 className="font-medium text-tag-text">Building Access — The Hubb</h3>
            <p className="mt-2 text-sm leading-relaxed text-tag-muted">
              TAG is located inside The Hubb. The front door of the building is open from{' '}
              <span className="font-mono text-tag-orange">08:00 – 17:00</span> on weekdays. Outside
              these hours you can continue working, but the doors will be locked. You can be let in by
              other members, or{' '}
              <Link
                href="/portal/info"
                className="text-tag-text underline decoration-tag-dim/50 underline-offset-2 hover:decoration-tag-text"
              >
                contact a community manager
              </Link>{' '}
              in advance.
            </p>
          </div>
        </>
      )}
    </>
  )
}
