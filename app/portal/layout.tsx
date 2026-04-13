import { PortalSidebar } from '@lib/portal/components'
import { getUser } from '@lib/auth/queries'

export const dynamic = 'force-dynamic'

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser()

  return (
    <div className="relative min-h-screen bg-tag-bg pt-14">
      {/* Dot grid background */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.14]"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(240,235,227,0.5) 0.75px, transparent 0.75px)',
          backgroundSize: '16px 16px',
        }}
      />
      <PortalSidebar
        role={user.role}
        avatarUrl={user.avatar_url}
        name={user.name}
        isSuperAdmin={user.is_super_admin}
      />
      <div className="relative z-10 mx-auto max-w-5xl px-6 pb-20 pt-10 md:px-10 md:pb-10">
        {children}
      </div>
    </div>
  )
}
