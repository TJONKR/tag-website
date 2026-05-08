import type { Metadata } from 'next'

import { PageShell } from '@components/page-shell'
import { EcosystemHero, ThesisSection, PartnerGrid } from '@lib/ecosystem/components'

const title = 'The TAG Ecosystem'
const description = 'The builders, hackers, and creators that make TAG. Meet the community.'

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description },
  twitter: { card: 'summary_large_image', title, description },
}

export default function EcosystemPage() {
  return (
    <PageShell>
      <EcosystemHero />
      <ThesisSection />
      <PartnerGrid />
    </PageShell>
  )
}
