'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Calendar,
  Clock,
  Mail,
  Map,
  Menu,
  ScrollText,
  Wifi,
  X,
} from 'lucide-react'
import { useState } from 'react'

import { cn } from '@lib/utils'
import { portalNavGroups } from '@lib/portal/data'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  calendar: Calendar,
  'scroll-text': ScrollText,
  wifi: Wifi,
  clock: Clock,
  mail: Mail,
  map: Map,
}

export const PortalSidebar = () => {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed left-4 top-20 z-50 rounded-md border border-tag-border bg-tag-bg p-2 md:hidden"
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {/* Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-14 z-40 flex h-[calc(100vh-3.5rem)] w-64 flex-col border-r border-tag-border bg-tag-bg transition-transform md:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <nav className="flex-1 space-y-6 px-3 pt-4">
          {portalNavGroups.map((group) => (
            <div key={group.label}>
              <span className="px-3 font-mono text-[10px] uppercase tracking-[0.15em] text-tag-dim">
                {group.label}
              </span>
              <div className="mt-2 space-y-0.5">
                {group.items.map((item) => {
                  const Icon = iconMap[item.icon]
                  const isActive = pathname === item.href

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                        isActive
                          ? 'bg-tag-orange/10 text-tag-orange'
                          : 'text-tag-muted hover:bg-tag-card hover:text-tag-text'
                      )}
                    >
                      {Icon && <Icon className="size-4 shrink-0" />}
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  )
}
