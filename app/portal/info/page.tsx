'use client'

import { useState } from 'react'
import { Hash, ScrollText, User } from 'lucide-react'

import { PortalHeader, InfoCard } from '@lib/portal/components'
import { houseRules, communityManagers } from '@lib/portal/data'
import { cn } from '@lib/utils'

const tabs = [
  { key: 'house-rules', label: 'House Rules' },
  { key: 'contact', label: 'Contact' },
] as const

type Tab = (typeof tabs)[number]['key']

export default function InfoPage() {
  const [activeTab, setActiveTab] = useState<Tab>('house-rules')

  return (
    <>
      <PortalHeader
        title="Info"
        description="House rules, contact details and community managers."
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

      {/* House Rules */}
      {activeTab === 'house-rules' && (
        <div className="grid gap-4 sm:grid-cols-2">
          {houseRules.map((rule) => (
            <InfoCard
              key={rule.title}
              title={rule.title}
              description={rule.description}
              icon={<ScrollText className="size-4" />}
            />
          ))}
        </div>
      )}

      {/* Contact */}
      {activeTab === 'contact' && (
        <>
          <div className="rounded-lg border border-tag-border bg-tag-card p-5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-tag-orange">
                <Hash className="size-4" />
              </div>
              <div>
                <h3 className="font-medium text-tag-text">Slack</h3>
                <p className="mt-1 text-sm leading-relaxed text-tag-muted">
                  We use Slack for general communication. Ask a community manager to add you to our
                  workspace.
                </p>
              </div>
            </div>
          </div>

          <h2 className="mb-4 mt-10 font-syne text-xl font-bold text-tag-text">
            Community Managers
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {communityManagers.map((manager) => (
              <div
                key={manager.name}
                className="flex items-center gap-3 rounded-lg border border-tag-border bg-tag-card p-4"
              >
                <div className="flex size-9 items-center justify-center rounded-full bg-tag-orange/10">
                  <User className="size-4 text-tag-orange" />
                </div>
                <span className="font-medium text-tag-text">{manager.name}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  )
}
