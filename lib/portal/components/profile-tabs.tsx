'use client'

import { useCallback } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@components/ui/tabs'
import { cn } from '@lib/utils'

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
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const raw = searchParams.get('tab')
  const active: TabKey = isTabKey(raw) ? raw : 'overview'

  const handleChange = useCallback(
    (next: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (next === 'overview') params.delete('tab')
      else params.set('tab', next)
      const qs = params.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [pathname, router, searchParams]
  )

  return (
    <Tabs value={active} onValueChange={handleChange} className="w-full">
      <TabsList className="mb-8 h-auto w-full justify-start gap-1 rounded-none border-b border-tag-border bg-transparent p-0">
        {TABS.map((tab) => (
          <TabsTrigger
            key={tab.key}
            value={tab.key}
            className={cn(
              '-mb-px rounded-none border-b-2 border-transparent bg-transparent px-5 py-3 font-mono text-xs uppercase tracking-[0.14em] text-tag-muted shadow-none transition-colors',
              'hover:text-tag-text',
              'data-[state=active]:border-tag-orange data-[state=active]:bg-transparent data-[state=active]:text-tag-orange data-[state=active]:shadow-none'
            )}
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
