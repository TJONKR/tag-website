import { PageShell } from '@components/page-shell'
import { EcosystemHero, ThesisSection, PartnerGrid } from '@lib/ecosystem/components'

export default function EcosystemPage() {
  return (
    <PageShell>
      <EcosystemHero />
      <ThesisSection />
      <PartnerGrid />
    </PageShell>
  )
}
