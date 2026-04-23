'use client'

import { useCallback, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@components/ui/tabs'
import { PORTAL_TABS_LIST_CLASSES, PORTAL_TABS_TRIGGER_CLASSES } from './portal-tabs-style'

const TAB_KEYS = ['overview', 'identity', 'account'] as const
type TabKey = (typeof TAB_KEYS)[number]

const TABS: { key: TabKey; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'identity', label: 'Identity' },
  { key: 'account', label: 'Account' },
]

function isTabKey(value: string | null | undefined): value is TabKey {
  return !!value && (TAB_KEYS as readonly string[]).includes(value)
}

interface ProfileTabsProps {
  overview: React.ReactNode
  identity: React.ReactNode
  account: React.ReactNode
}

export const ProfileTabs = ({ overview, identity, account }: ProfileTabsProps) => {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const raw = searchParams.get('tab')
  const [active, setActive] = useState<TabKey>(isTabKey(raw) ? raw : 'overview')

  const handleChange = useCallback(
    (next: string) => {
      if (!isTabKey(next)) return
      setActive(next)
      const params = new URLSearchParams(searchParams.toString())
      if (next === 'overview') params.delete('tab')
      else params.set('tab', next)
      const qs = params.toString()
      const url = qs ? `${pathname}?${qs}` : pathname
      window.history.replaceState(null, '', url)
    },
    [pathname, searchParams]
  )

  return (
    <Tabs value={active} onValueChange={handleChange} className="w-full">
      <TabsList className={PORTAL_TABS_LIST_CLASSES}>
        {TABS.map((tab) => (
          <TabsTrigger
            key={tab.key}
            value={tab.key}
            className={PORTAL_TABS_TRIGGER_CLASSES}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="overview" className="mt-0">
        {overview}
      </TabsContent>
      <TabsContent value="identity" className="mt-0">
        {identity}
      </TabsContent>
      <TabsContent value="account" className="mt-0">
        {account}
      </TabsContent>
    </Tabs>
  )
}
