import { slugifyName } from '@lib/utils'
import { createServerSupabaseClient } from '@lib/db'
import { FadeIn, PortalHeader, ProfileTabs } from '@lib/portal/components'
import { getUser } from '@lib/auth/queries'
import { ProfileOverviewTab } from '@lib/auth/components/profile-overview-tab'
import { ProfileIdentityTab } from '@lib/auth/components/profile-identity-tab'
import { ProfileAccountTab } from '@lib/auth/components/profile-account-tab'
import { getUserAttendedEvents, getUserCheckedInCount } from '@lib/events/queries'
import { getMembershipStatus } from '@lib/membership/queries'
import { getOnboardingProfile } from '@lib/onboarding/queries'
import { getBuilderProfile } from '@lib/taste/queries'
import { getUserPhotos } from '@lib/photos/queries'
import {
  getEquippedSkin,
  getUserSkins,
  getPendingSkin,
  getAvailableLootboxCount,
} from '@lib/lootbox/queries'
import { ensureFirstLootbox } from '@lib/lootbox/mutations'
import { MAX_PHOTOS } from '@lib/photos/types'

export default async function ProfilePage() {
  const user = await getUser()
  const [
    attendedEvents,
    membershipStatus,
    onboardingProfile,
    checkedInCount,
    builderProfile,
    userPhotos,
    equippedSkin,
    userSkins,
    pendingSkin,
    initialAvailableLootboxCount,
  ] = await Promise.all([
    getUserAttendedEvents(user.id),
    getMembershipStatus(user.id, user.role),
    getOnboardingProfile(user.id),
    getUserCheckedInCount(user.id),
    getBuilderProfile(user.id),
    getUserPhotos(user.id),
    getEquippedSkin(user.id),
    getUserSkins(user.id),
    getPendingSkin(user.id),
    getAvailableLootboxCount(user.id),
  ])

  // Signed URLs for the photos modal
  const supabase = await createServerSupabaseClient()
  const photoUrls: Record<string, string> = {}
  for (const photo of userPhotos) {
    const { data } = await supabase.storage
      .from('user-photos')
      .createSignedUrl(photo.storage_path, 3600)
    if (data?.signedUrl) {
      photoUrls[photo.id] = data.signedUrl
    }
  }

  const hasSocial =
    !!onboardingProfile.linkedin_url ||
    !!onboardingProfile.twitter_url ||
    !!onboardingProfile.github_url ||
    !!onboardingProfile.website_url ||
    !!onboardingProfile.instagram_url

  const hasEnoughPhotos = userPhotos.length >= MAX_PHOTOS

  const lootboxSteps = [
    { label: 'Set your name', done: !!user.name },
    { label: 'Upload avatar', done: !!user.avatar_url },
    { label: 'What you\'re building', done: !!onboardingProfile.building },
    { label: 'Why TAG', done: !!onboardingProfile.why_tag },
    { label: 'Add a social link', done: hasSocial },
    { label: 'Upload 3 reference photos', done: hasEnoughPhotos },
  ]
  const lootboxAllDone = lootboxSteps.every((s) => s.done)

  // Grant the first lootbox the moment onboarding is fully complete.
  // Idempotent — only inserts on the first eligible render.
  let availableLootboxCount = initialAvailableLootboxCount
  if (lootboxAllDone) {
    const granted = await ensureFirstLootbox(user.id)
    if (granted) availableLootboxCount += 1
  }

  const publicSlug = user.name ? slugifyName(user.name) : null

  return (
    <>
      <FadeIn>
        <PortalHeader
          title="Profile"
          description="Your TAG identity, status, and account."
        />
      </FadeIn>

      <ProfileTabs
        overview={
          <ProfileOverviewTab
            user={user}
            attendedEvents={attendedEvents}
            checkedInCount={checkedInCount}
            membershipStatus={membershipStatus}
            onboardingProfile={onboardingProfile}
            builderProfile={builderProfile}
            userPhotos={userPhotos}
            photoUrls={photoUrls}
            equippedSkin={equippedSkin}
            userSkins={userSkins}
            pendingSkin={pendingSkin}
            availableLootboxCount={availableLootboxCount}
            hasEnoughPhotos={hasEnoughPhotos}
            lootboxSteps={lootboxSteps}
            lootboxAllDone={lootboxAllDone}
          />
        }
        identity={
          <ProfileIdentityTab
            onboardingProfile={onboardingProfile}
            initialBuilderProfile={builderProfile}
            publicSlug={publicSlug}
          />
        }
        account={<ProfileAccountTab user={user} />}
      />
    </>
  )
}
