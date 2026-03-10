import { PortalHeader } from '@lib/portal/components'
import { getUser } from '@lib/auth/queries'
import { getFacilities, getHouseRules, getOpeningHours } from '@lib/portal/queries'
import { SpaceTabs } from '@lib/portal/components/space-tabs'

export default async function SpacePage() {
  const user = await getUser()
  const [facilities, houseRules, openingHours] = await Promise.all([
    getFacilities(),
    getHouseRules(),
    getOpeningHours(),
  ])

  return (
    <>
      <PortalHeader
        title="Space"
        description="Everything about the TAG workspace — floor plan, facilities, opening hours and house rules."
      />
      <SpaceTabs
        facilities={facilities}
        openingHours={openingHours}
        houseRules={houseRules}
        isAdmin={user.role === 'operator'}
      />
    </>
  )
}
