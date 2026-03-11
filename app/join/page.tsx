import { PageShell } from '@components/page-shell'
import { JoinHero, SignupForm } from '@lib/join/components'

export default function JoinPage() {
  return (
    <PageShell>
      <JoinHero />
      <SignupForm />
    </PageShell>
  )
}
