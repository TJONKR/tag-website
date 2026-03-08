import { PortalSidebar } from '@lib/portal/components'
import { getUser } from '@lib/auth/queries'

export const dynamic = 'force-dynamic'

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  await getUser()

  return (
    <div className="min-h-screen bg-tag-bg pt-14">
      <PortalSidebar />
      <div className="mx-auto max-w-4xl px-6 pb-20 pt-10 md:px-10 md:pb-10">{children}</div>
    </div>
  )
}
