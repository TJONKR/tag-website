import Image from 'next/image'
import { Calendar, Check, Shield, Star } from 'lucide-react'

import { cn } from '@lib/utils'
import { PortalHeader } from '@lib/portal/components'
import { EditNameForm } from '@lib/auth/components/edit-name-form'
import { EditProfileForm } from '@lib/auth/components/edit-profile-form'
import { SignOutForm } from '@lib/auth/components/sign-out-form'
import { AvatarUpload } from '@lib/auth/components/avatar-upload'
import { getUser } from '@lib/auth/queries'
import { getUserAttendedEvents, getUserCheckedInCount } from '@lib/events/queries'
import { getMembershipStatus } from '@lib/membership/queries'
import { getOnboardingProfile } from '@lib/onboarding/queries'
import {
  MembershipCard,
  UpgradeCard,
  ManageSubscription,
} from '@lib/membership/components'
import { getBuilderProfile } from '@lib/taste/queries'
import { LootboxProgress } from '@lib/portal/components/lootbox-progress'
import { ProfileEventTimeline } from '@lib/events/components'
import { getUserPhotos } from '@lib/photos/queries'
import { getEquippedSkin, getUserSkins, getPendingSkin } from '@lib/lootbox/queries'
import { PhotoUpload } from '@lib/photos/components'
import { LootboxOpening, SkinsCollection } from '@lib/lootbox/components'
import { MAX_PHOTOS } from '@lib/photos/types'
import { createServerSupabaseClient } from '@lib/db'
import type { UserRole } from '@lib/auth/types'

const roleConfig: Record<UserRole, { label: string; icon: typeof Check; color: string }> = {
  ambassador: {
    label: 'Ambassador',
    icon: Star,
    color: 'text-tag-muted',
  },
  builder: {
    label: 'Builder',
    icon: Check,
    color: 'text-tag-orange',
  },
  operator: {
    label: 'Operator',
    icon: Shield,
    color: 'text-tag-orange',
  },
}

function formatMemberSince(dateStr: string): string {
  const date = new Date(dateStr)
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ]
  return `${months[date.getMonth()]} ${date.getFullYear()}`
}

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
  ])
  const config = roleConfig[user.role]
  const Icon = config.icon
  const isBuilder = user.role === 'builder' || user.role === 'operator'

  // Use equipped skin from new lootbox system, fall back to old builder_profiles.skin_url
  const equippedSkinUrl = equippedSkin?.image_url ?? builderProfile?.skin_url
  const hasSkin = !!equippedSkinUrl

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
  const lootboxCompleted = lootboxSteps.filter((s) => s.done).length
  const lootboxTotal = lootboxSteps.length
  const lootboxAllDone = lootboxCompleted === lootboxTotal

  // Stats
  const participationRate =
    attendedEvents.length > 0
      ? Math.round((checkedInCount / attendedEvents.length) * 100)
      : null

  // Get signed URLs for photos
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

  return (
    <>
      <PortalHeader title="Profile" description="Your account and membership details." />

      <div className="grid grid-cols-1 gap-8 md:grid-cols-[280px_1fr]">
        {/* ── Left Column ── */}
        <div className="space-y-6 md:sticky md:top-20 md:self-start">
          {/* Hero Identity Card */}
          <div
            className={cn(
              'rounded-lg border bg-tag-card',
              isBuilder ? 'border-tag-orange' : 'border-tag-border'
            )}
          >
            {hasSkin ? (
              /* Equipped skin hero */
              <div className="relative aspect-[3/4] overflow-hidden rounded-t-lg">
                <Image
                  src={equippedSkinUrl!}
                  alt={user.name ?? 'Profile skin'}
                  fill
                  className="object-cover"
                  sizes="280px"
                  unoptimized
                />
              </div>
            ) : (
              /* Avatar fallback */
              <div className="flex justify-center pt-8 pb-2">
                <AvatarUpload name={user.name} avatarUrl={user.avatar_url} />
              </div>
            )}

            <div className="p-5">
              <h2 className="font-syne text-xl font-bold text-tag-text">
                {user.name || 'Unnamed'}
              </h2>

              {builderProfile?.headline && (
                <p className="mt-1 text-sm text-tag-muted">{builderProfile.headline}</p>
              )}

              {builderProfile?.tags && builderProfile.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {builderProfile.tags.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-tag-orange/20 bg-tag-orange/5 px-2 py-0.5 text-[10px] text-tag-orange"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-4 flex items-center gap-2">
                <div
                  className={cn(
                    'flex size-6 items-center justify-center rounded-full',
                    isBuilder ? 'bg-tag-orange/10' : 'bg-tag-text/5'
                  )}
                >
                  <Icon className={cn('size-3', config.color)} />
                </div>
                <span className="text-xs font-medium text-tag-muted">{config.label}</span>
              </div>

              <div className="mt-2 flex items-center gap-1.5 text-xs text-tag-dim">
                <Calendar className="size-3" />
                Member since {formatMemberSince(user.created_at)}
              </div>
            </div>
          </div>

          {/* Lootbox progress / opening — left column */}
          {!lootboxAllDone && !hasSkin && <LootboxProgress steps={lootboxSteps} />}
          {(lootboxAllDone || pendingSkin) && !hasSkin && (
            <LootboxOpening
              hasPhotos={hasEnoughPhotos}
              pendingSkinId={pendingSkin?.id ?? null}
            />
          )}
        </div>

        {/* ── Right Column ── */}
        <div className="space-y-6">
          {/* Stats Strip */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-tag-border bg-tag-card p-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-tag-dim">
                Events
              </span>
              <p className="mt-1 font-syne text-2xl font-bold text-tag-text">
                {attendedEvents.length}
              </p>
            </div>
            <div className="rounded-lg border border-tag-border bg-tag-card p-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-tag-dim">
                Verified
              </span>
              <p className="mt-1 font-syne text-2xl font-bold text-tag-text">{checkedInCount}</p>
            </div>
            <div className="rounded-lg border border-tag-border bg-tag-card p-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-tag-dim">
                Rate
              </span>
              <p
                className={cn(
                  'mt-1 font-syne text-2xl font-bold',
                  participationRate === null
                    ? 'text-tag-dim'
                    : participationRate >= 75
                      ? 'text-green-500'
                      : participationRate >= 50
                        ? 'text-orange-400'
                        : 'text-tag-text'
                )}
              >
                {participationRate !== null ? `${participationRate}%` : '--'}
              </p>
            </div>
            <div className="rounded-lg border border-tag-border bg-tag-card p-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-tag-dim">
                Since
              </span>
              <p className="mt-1 font-syne text-lg font-bold text-tag-text">
                {formatMemberSince(user.created_at)}
              </p>
            </div>
          </div>

          {/* Photo Upload */}
          <div className="rounded-lg border border-tag-border bg-tag-card p-6">
            <PhotoUpload initialPhotos={userPhotos} photoUrls={photoUrls} />
          </div>

          {/* Skins Collection */}
          {userSkins.length > 0 && <SkinsCollection initialSkins={userSkins} />}

          {/* Membership */}
          <MembershipCard status={membershipStatus} />

          {membershipStatus.canUpgrade && <UpgradeCard />}

          {membershipStatus.subscription?.status === 'active' && <ManageSubscription />}

          {/* About / Edit Profile */}
          <EditProfileForm
            profile={{
              building: onboardingProfile.building,
              why_tag: onboardingProfile.why_tag,
              linkedin_url: onboardingProfile.linkedin_url,
              twitter_url: onboardingProfile.twitter_url,
              github_url: onboardingProfile.github_url,
              website_url: onboardingProfile.website_url,
              instagram_url: onboardingProfile.instagram_url,
            }}
          />

          {/* Event Timeline */}
          <ProfileEventTimeline events={attendedEvents} />

          {/* Account */}
          <div className="rounded-lg border border-tag-border bg-tag-card">
            <div className="px-6 pt-5 pb-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-tag-dim">
                Account
              </span>
            </div>
            <div className="divide-y divide-tag-border">
              <div className="px-6">
                <EditNameForm currentName={user.name} />
              </div>
              <div className="px-6 py-4">
                <span className="text-xs text-tag-muted">Email Address</span>
                <p className="text-sm text-tag-text">{user.email}</p>
              </div>
              <SignOutForm />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
