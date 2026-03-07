import { PortalSidebar } from '@lib/portal/components'

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-tag-bg pt-14">
      <PortalSidebar />
      <div className="md:pl-64">
        <div className="mx-auto max-w-4xl px-6 py-10 md:px-10">{children}</div>
      </div>
    </div>
  )
}
