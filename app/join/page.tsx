import { PageShell } from '@components/page-shell'
import { JoinHero, JoinForm } from '@lib/join/components'

export default function JoinPage() {
  return (
    <PageShell>
      <JoinHero />
      <JoinForm />
    </PageShell>
  )
}
