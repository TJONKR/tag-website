import type { Metadata } from 'next'

import { PageShell } from '@components/page-shell'
import { SpaceHero, AmenitiesGrid, PricingTiers, SpaceAddress } from '@lib/space/components'

const title = 'The TAG Space'
const description =
  'A space in Amsterdam for builders, hackers, and creators to meet, work, and ship.'

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description },
  twitter: { card: 'summary_large_image', title, description },
}

export default function SpacePage() {
  return (
    <PageShell>
      <SpaceHero />
      <SpaceAddress />
      <AmenitiesGrid />
      <PricingTiers />
    </PageShell>
  )
}
