import { Calendar, Check, Star, Shield, Users } from 'lucide-react'

import { PortalHeader } from '@lib/portal/components'
import { EditNameForm } from '@lib/auth/components/edit-name-form'
import { SignOutForm } from '@lib/auth/components/sign-out-form'
import { AvatarUpload } from '@lib/auth/components/avatar-upload'
import { getUser } from '@lib/auth/queries'
import { getUserAttendedEvents } from '@lib/events/queries'
import { formatDateDisplay } from '@lib/events/types'
import { pricingTiers } from '@lib/space/data'
import type { UserRole } from '@lib/auth/types'

const roleConfig: Record<UserRole, { label: string; icon: typeof Check; color: string }> = {
  rookie: {
    label: 'Rookie',
    icon: Star,
    color: 'text-tag-muted',
  },
  builder: {
    label: 'Builder',
    icon: Check,
    color: 'text-tag-orange',
  },
  admin: {
    label: 'Community Manager',
    icon: Shield,
    color: 'text-tag-orange',
  },
}

function formatMemberSince(dateStr: string): string {
  const date = new Date(dateStr)
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ]
  return `${months[date.getMonth()]} ${date.getFullYear()}`
}

export default async function ProfilePage() {
  const user = await getUser()
  const attendedEvents = await getUserAttendedEvents(user.id)
  const config = roleConfig[user.role]
  const Icon = config.icon
  const isBuilder = user.role === 'builder' || user.role === 'admin'
  const builderTier = pricingTiers.find((t) => t.name === 'Builder')

  return (
    <>
      <PortalHeader title="Profile" description="Your account and membership details." />

      {/* Membership card */}
      <div
        className={`rounded-lg border bg-tag-card p-6 ${isBuilder ? 'border-tag-orange' : 'border-tag-border'}`}
      >
        <div className="flex items-center gap-5">
          <AvatarUpload name={user.name} avatarUrl={user.avatar_url} />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-tag-dim">
                  Membership
                </span>
                <h2 className="mt-1 font-syne text-2xl font-bold text-tag-text">
                  {config.label}
                </h2>
              </div>
              <div
                className={`flex size-10 items-center justify-center rounded-full ${isBuilder ? 'bg-tag-orange/10' : 'bg-tag-text/5'}`}
              >
                <Icon className={`size-5 ${config.color}`} />
              </div>
            </div>

            <div className="mt-3 flex gap-6">
              <div className="flex items-center gap-1.5 text-sm text-tag-muted">
                <Calendar className="size-3.5 text-tag-dim" />
                Member since {formatMemberSince(user.created_at)}
              </div>
              <div className="flex items-center gap-1.5 text-sm text-tag-muted">
                <Users className="size-3.5 text-tag-dim" />
                {attendedEvents.length} event{attendedEvents.length !== 1 ? 's' : ''} attended
              </div>
            </div>
          </div>
        </div>

        {isBuilder && builderTier && (
          <ul className="mt-6 grid gap-2 sm:grid-cols-2">
            {builderTier.features.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm text-tag-muted">
                <Check className="size-3.5 shrink-0 text-tag-orange" />
                {feature}
              </li>
            ))}
          </ul>
        )}

        {!isBuilder && (
          <p className="mt-4 text-sm text-tag-muted">
            As a rookie you can drop by for events. Want a permanent desk?{' '}
            <span className="text-tag-text">Reach out to a community manager.</span>
          </p>
        )}
      </div>

      {/* Attended events */}
      {attendedEvents.length > 0 && (
        <div className="mt-6 rounded-lg border border-tag-border bg-tag-card">
          <div className="px-6 pt-5 pb-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-tag-dim">
              Events Attended
            </span>
          </div>
          <div className="divide-y divide-tag-border">
            {attendedEvents.map((event) => (
              <div key={event.id} className="flex items-center gap-4 px-6 py-3">
                <span className="w-14 shrink-0 font-mono text-xs font-bold text-tag-orange">
                  {formatDateDisplay(event.date_iso)}
                </span>
                <span className="text-sm text-tag-text">{event.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Account info */}
      <div className="mt-6 rounded-lg border border-tag-border bg-tag-card">
        <div className="px-6 pt-5 pb-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-tag-dim">
            Account
          </span>
        </div>
        <div className="divide-y divide-tag-border">
          <div className="px-6">
            <EditNameForm currentName={user.name} />
          </div>
          <div className="px-6 py-4">
            <span className="text-xs text-tag-muted">Email Address</span>
            <p className="text-sm text-tag-text">{user.email}</p>
          </div>
          <SignOutForm />
        </div>
      </div>
    </>
  )
}
