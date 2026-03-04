import { PageShell } from '@components/page-shell'
import { SpaceHero, AmenitiesGrid, PricingTiers } from '@lib/space/components'

export default function SpacePage() {
  return (
    <PageShell>
      <SpaceHero />
      <AmenitiesGrid />
      <PricingTiers />
    </PageShell>
  )
}
