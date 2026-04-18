import { FadeIn } from '@lib/portal/components'
import { EditNameForm } from '@lib/auth/components/edit-name-form'
import { SignOutForm } from '@lib/auth/components/sign-out-form'

import type { AuthUser, UserRole } from '@lib/auth/types'

const roleLabels: Record<UserRole, string> = {
  ambassador: 'Ambassador',
  builder: 'Builder',
  operator: 'Operator',
}

interface ProfileAccountTabProps {
  user: AuthUser
}

export const ProfileAccountTab = ({ user }: ProfileAccountTabProps) => {
  return (
    <div className="max-w-xl space-y-4">
      <FadeIn>
        <div className="rounded-lg border border-tag-border bg-tag-card">
          <div className="px-5">
            <EditNameForm currentName={user.name} />
          </div>
          <div className="border-t border-tag-border px-5 py-4">
            <span className="text-sm text-tag-muted">Email</span>
            <p className="text-sm text-tag-text">{user.email}</p>
          </div>
          <div className="border-t border-tag-border px-5 py-4">
            <span className="text-sm text-tag-muted">Role</span>
            <div className="flex items-center justify-between">
              <p className="text-sm text-tag-text">{roleLabels[user.role]}</p>
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-tag-dim">
                Managed by admins
              </span>
            </div>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={75}>
        <div className="rounded-lg border border-dashed border-destructive/30 p-5">
          <span className="font-mono text-xs uppercase tracking-[0.15em] text-destructive/70">
            Session
          </span>
          <p className="mt-1 text-sm text-tag-muted">Sign out of this device.</p>
          <div className="mt-3">
            <SignOutForm />
          </div>
        </div>
      </FadeIn>
    </div>
  )
}
