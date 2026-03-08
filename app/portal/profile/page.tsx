import { Check, Star, Shield } from 'lucide-react'

import { PortalHeader } from '@lib/portal/components'
import { EditNameForm } from '@lib/auth/components/edit-name-form'
import { SignOutForm } from '@lib/auth/components/sign-out-form'
import { getUser } from '@lib/auth/queries'
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

export default async function ProfilePage() {
  const user = await getUser()
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
        <div className="flex items-center justify-between">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-tag-dim">
              Membership
            </span>
            <h2 className="mt-1 font-syne text-2xl font-bold text-tag-text">{config.label}</h2>
          </div>
          <div
            className={`flex size-10 items-center justify-center rounded-full ${isBuilder ? 'bg-tag-orange/10' : 'bg-tag-text/5'}`}
          >
            <Icon className={`size-5 ${config.color}`} />
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

      {/* Account info */}
      <div className="mt-6 rounded-lg border border-tag-border bg-tag-card">
        <div className="px-6 pt-5 pb-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-tag-dim">
            Account
          </span>
        </div>
        <div className="divide-y divide-tag-border px-6">
          <EditNameForm currentName={user.name} />
          <div className="py-3">
            <span className="text-xs text-tag-muted">Email Address</span>
            <p className="text-sm text-tag-text">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Sign out */}
      <div className="mt-6">
        <SignOutForm />
      </div>
    </>
  )
}
