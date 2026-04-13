'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calendar, Map, Shield, Sparkles, User, Users } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar'
import { cn } from '@lib/utils'
import { portalNavGroups } from '@lib/portal/data'

import type { UserRole } from '@lib/auth/types'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  calendar: Calendar,
  map: Map,
  shield: Shield,
  sparkles: Sparkles,
  user: User,
  users: Users,
}

const getInitials = (name: string | null | undefined) => {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

interface PortalSidebarProps {
  role?: UserRole
  avatarUrl?: string | null
  name?: string | null
  isSuperAdmin?: boolean
}

export const PortalSidebar = ({
  role,
  avatarUrl,
  name,
  isSuperAdmin = false,
}: PortalSidebarProps) => {
  const pathname = usePathname()
  const isProfileActive = pathname === '/portal/profile'

  const allItems = portalNavGroups
    .flatMap((group) => group.items)
    .filter((item) => {
      if (item.requiredSuperAdmin && !isSuperAdmin) return false
      if (item.requiredRole && item.requiredRole !== role) return false
      return true
    })

  return (
    <>
      {/* Desktop top nav */}
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-tag-border bg-tag-bg">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center px-6 md:px-10">
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
                    'flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.1em] transition-colors',
                    isActive ? 'text-tag-orange' : 'text-tag-muted hover:text-tag-text'
                  )}
                >
                  {Icon && <Icon className="size-3.5" />}
                  {item.label}
                </Link>
              )
            })}

            <Link
              href="/portal/profile"
              className={cn(
                'rounded-full ring-2 ring-transparent transition-all',
                isProfileActive ? 'ring-tag-orange' : 'hover:ring-tag-muted'
              )}
            >
              <Avatar className="size-7">
                {avatarUrl && <AvatarImage src={avatarUrl} alt={name ?? 'Profile'} />}
                <AvatarFallback className="bg-tag-border text-[11px] font-medium text-tag-text">
                  {getInitials(name)}
                </AvatarFallback>
              </Avatar>
            </Link>
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

          <Link
            href="/portal/profile"
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-1 transition-colors',
              isProfileActive ? 'text-tag-orange' : 'text-tag-muted'
            )}
          >
            <Avatar className="size-5">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={name ?? 'Profile'} />}
              <AvatarFallback className="bg-tag-border text-[8px] font-medium text-tag-text">
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>
            <span className="font-mono text-[10px] uppercase tracking-[0.05em]">Profile</span>
          </Link>
        </div>
      </nav>
    </>
  )
}
