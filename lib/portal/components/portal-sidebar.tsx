'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calendar, Map, Sparkles, User, Users } from 'lucide-react'

import { cn } from '@lib/utils'
import { portalNavGroups } from '@lib/portal/data'

import type { UserRole } from '@lib/auth/types'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  calendar: Calendar,
  map: Map,
  sparkles: Sparkles,
  user: User,
  users: Users,
}

interface PortalSidebarProps {
  role?: UserRole
}

export const PortalSidebar = ({ role }: PortalSidebarProps) => {
  const pathname = usePathname()

  const allItems = portalNavGroups
    .flatMap((group) => group.items)
    .filter((item) => !item.requiredRole || item.requiredRole === role)

  return (
    <>
      {/* Desktop top nav */}
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-tag-border bg-tag-bg">
        <div className="mx-auto flex h-14 w-full max-w-4xl items-center px-6 md:px-10">
          <Link href="/" className="font-syne text-xl font-extrabold text-tag-text">
            TAG
          </Link>

          <div className="ml-auto hidden items-center gap-6 md:flex">
            {allItems.map((item) => {
              const Icon = iconMap[item.icon]
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-1.5 font-mono text-[12px] uppercase tracking-[0.1em] transition-colors',
                    isActive ? 'text-tag-orange' : 'text-tag-muted hover:text-tag-text'
                  )}
                >
                  {Icon && <Icon className="size-3.5" />}
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-tag-border bg-tag-bg md:hidden">
        <div className="flex h-14 items-stretch">
          {allItems.map((item) => {
            const Icon = iconMap[item.icon]
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-1 flex-col items-center justify-center gap-1 transition-colors',
                  isActive ? 'text-tag-orange' : 'text-tag-muted'
                )}
              >
                {Icon && <Icon className="size-5" />}
                <span className="font-mono text-[10px] uppercase tracking-[0.05em]">
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
