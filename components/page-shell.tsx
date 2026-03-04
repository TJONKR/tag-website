import { GrainOverlay } from '@components/landing/grain-overlay'
import { Footer } from '@components/landing/footer'

interface PageShellProps {
  children: React.ReactNode
}

export const PageShell = ({ children }: PageShellProps) => {
  return (
    <>
      <GrainOverlay />
      <main className="min-h-screen bg-tag-bg pt-14">{children}</main>
      <Footer />
    </>
  )
}
