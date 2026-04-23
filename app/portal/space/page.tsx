import { PortalHeader, FadeIn } from '@lib/portal/components'
import { getUser } from '@lib/auth/queries'
import { getContactItems, getFacilities, getGuidelines, getOpeningHours } from '@lib/portal/queries'
import { SpaceTabs } from '@lib/portal/components/space-tabs'
import { getSpacePhotos } from '@lib/space-photos/queries'

export default async function SpacePage() {
  const user = await getUser()
  const [facilities, guidelines, openingHours, contactItems, spacePhotos] = await Promise.all([
    getFacilities(),
    getGuidelines(),
    getOpeningHours(),
    getContactItems(),
    getSpacePhotos(),
  ])

  return (
    <>
      <FadeIn>
        <PortalHeader
          title="Space"
          description="Everything about the TAG workspace — floor plan, facilities, opening hours and guidelines."
        />
      </FadeIn>
      <FadeIn delay={75}>
        <SpaceTabs
          facilities={facilities}
          openingHours={openingHours}
          guidelines={guidelines}
          contactItems={contactItems}
          spacePhotos={spacePhotos}
          isAdmin={user.role === 'operator'}
        />
      </FadeIn>
    </>
  )
}
