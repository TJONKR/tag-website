import Image from 'next/image'
import { Calendar, Check, Shield, Star } from 'lucide-react'

import { cn } from '@lib/utils'
import { FadeIn } from '@lib/portal/components'
import { LootboxProgress } from '@lib/portal/components/lootbox-progress'
import {
  ClaimPendingNotice,
  MembershipCard,
  UpgradeCard,
} from '@lib/membership/components'
import { LootboxOpening, SkinsCollection } from '@lib/lootbox/components'
import { rarityStyles } from '@lib/lootbox/rarity'
import { PhotosModal } from '@lib/photos/components'
import { ProfileEventTimeline } from '@lib/events/components'
import { AvatarUpload } from '@lib/auth/components/avatar-upload'
import { SocialLinks } from '@lib/auth/components/social-links'
import { TierBadge } from '@lib/milestones/components'
import { computeTier } from '@lib/milestones/tiers'

import type { AuthUser, UserRole } from '@lib/auth/types'
import type { MembershipStatus } from '@lib/membership/types'
import type { OnboardingProfile } from '@lib/onboarding/types'
import type { BuilderProfile } from '@lib/taste/types'
import type { UserSkin } from '@lib/lootbox/types'
import type { UserPhoto } from '@lib/photos/types'

interface AttendedEvent {
  id: string
  title: string
  date_iso: string
  checked_in_at: string | null
}

const roleConfig: Record<UserRole, { label: string; icon: typeof Check; color: string }> = {
  ambassador: { label: 'Ambassador', icon: Star, color: 'text-tag-muted' },
  builder: { label: 'Builder', icon: Check, color: 'text-tag-orange' },
  operator: { label: 'Operator', icon: Shield, color: 'text-tag-orange' },
}

function formatMemberSince(dateStr: string): string {
  const date = new Date(dateStr)
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ]
  return `${months[date.getMonth()]} ${date.getFullYear()}`
}

interface ProfileOverviewTabProps {
  user: AuthUser
  attendedEvents: AttendedEvent[]
  checkedInCount: number
  membershipStatus: MembershipStatus
  onboardingProfile: OnboardingProfile
  builderProfile: BuilderProfile | null
  userPhotos: UserPhoto[]
  photoUrls: Record<string, string>
  equippedSkin: UserSkin | null
  userSkins: UserSkin[]
  pendingSkin: UserSkin | null
  availableLootboxCount: number
  hasEnoughPhotos: boolean
  lootboxSteps: { label: string; done: boolean }[]
  lootboxAllDone: boolean
}

export const ProfileOverviewTab = ({
  user,
  attendedEvents,
  checkedInCount,
  membershipStatus,
  onboardingProfile,
  builderProfile,
  userPhotos,
  photoUrls,
  equippedSkin,
  userSkins,
  pendingSkin,
  availableLootboxCount,
  hasEnoughPhotos,
  lootboxSteps,
  lootboxAllDone,
}: ProfileOverviewTabProps) => {
  const config = roleConfig[user.role]
  const Icon = config.icon
  const isBuilder = user.role === 'builder' || user.role === 'operator'

  const equippedSkinUrl = equippedSkin?.image_url ?? builderProfile?.skin_url
  const hasSkin = !!equippedSkinUrl
  const skinRarity = equippedSkin?.rarity ? rarityStyles[equippedSkin.rarity] : null

  const tier = computeTier({
    onboardingProfile,
    builderProfile,
    photoCount: userPhotos.length,
    checkedInCount,
  })

  const participationRate =
    attendedEvents.length > 0
      ? Math.round((checkedInCount / attendedEvents.length) * 100)
      : null

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-[336px_1fr]">
      {/* ── Left column: hero identity ── */}
      <div className="space-y-6 md:sticky md:top-20 md:self-start">
        <FadeIn delay={75}>
          <div className="rounded-lg border border-tag-border bg-tag-card">
            <PhotosModal
              photos={userPhotos}
              photoUrls={photoUrls}
              trigger={
                <button type="button" className="group block w-full text-left">
                  {hasSkin ? (
                    <div
                      className={cn(
                        'relative aspect-[3/4] overflow-hidden rounded-t-lg',
                        skinRarity && ['border-2', skinRarity.border, skinRarity.glow]
                      )}
                    >
                      <Image
                        src={equippedSkinUrl!}
                        alt={user.name ?? 'Profile skin'}
                        fill
                        className="object-cover transition-opacity group-hover:opacity-80"
                        sizes="336px"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="flex justify-center pb-2 pt-8">
                      <AvatarUpload name={user.name} avatarUrl={user.avatar_url} />
                    </div>
                  )}
                </button>
              }
            />

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
                      className="rounded-full border border-tag-orange/20 bg-tag-orange/5 px-2 py-0.5 text-sm text-tag-orange"
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
                <span className="text-sm font-medium text-tag-muted">{config.label}</span>
              </div>

              <div className="mt-2 flex items-center gap-2">
                <div className="flex size-6 items-center justify-center rounded-full bg-tag-orange/10">
                  <Calendar className="size-3 text-tag-orange" />
                </div>
                <span className="text-sm font-medium text-tag-muted">
                  Since {formatMemberSince(user.created_at)}
                </span>
              </div>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={150}>
          <SocialLinks
            profile={{
              linkedin_url: onboardingProfile.linkedin_url,
              twitter_url: onboardingProfile.twitter_url,
              github_url: onboardingProfile.github_url,
              website_url: onboardingProfile.website_url,
              instagram_url: onboardingProfile.instagram_url,
            }}
          />
        </FadeIn>

        <FadeIn delay={200}>
          <TierBadge tier={tier} />
        </FadeIn>

        {/* Lootbox progress (onboarding-completion checklist) */}
        {!lootboxAllDone && !hasSkin && (
          <FadeIn delay={225}>
            <LootboxProgress steps={lootboxSteps} />
          </FadeIn>
        )}
      </div>

      {/* ── Right column: magazine layout ── */}
      <div className="max-w-xl space-y-6">
        {/* Lootbox opener — prominent when there's anything to open */}
        {(((lootboxAllDone || pendingSkin) && !hasSkin) ||
          availableLootboxCount > 0 ||
          pendingSkin) && (
          <FadeIn delay={100}>
            <LootboxOpening
              hasPhotos={hasEnoughPhotos}
              photos={userPhotos}
              photoUrls={photoUrls}
              availableCount={availableLootboxCount}
              pendingSkinId={pendingSkin?.id ?? null}
            />
          </FadeIn>
        )}

        {/* Stats strip — quiet */}
        <FadeIn delay={150}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-tag-border bg-tag-card p-4">
              <span className="font-mono text-xs uppercase tracking-[0.15em] text-tag-dim">
                Events
              </span>
              <p className="mt-1 font-syne text-2xl font-bold text-tag-text">
                {attendedEvents.length}
              </p>
            </div>
            <div className="rounded-lg border border-tag-border bg-tag-card p-4">
              <span className="font-mono text-xs uppercase tracking-[0.15em] text-tag-dim">
                Verified
              </span>
              <p className="mt-1 font-syne text-2xl font-bold text-tag-text">{checkedInCount}</p>
            </div>
            <div className="rounded-lg border border-tag-border bg-tag-card p-4">
              <span className="font-mono text-xs uppercase tracking-[0.15em] text-tag-dim">
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
            <div
              className={cn(
                'rounded-lg border bg-tag-card p-4 transition-colors',
                availableLootboxCount > 0
                  ? 'border-tag-orange/40 shadow-[0_0_20px_rgba(255,95,31,0.1)]'
                  : 'border-tag-border'
              )}
            >
              <span className="font-mono text-xs uppercase tracking-[0.15em] text-tag-dim">
                Lootboxes
              </span>
              <p
                className={cn(
                  'mt-1 font-syne text-2xl font-bold',
                  availableLootboxCount > 0 ? 'text-tag-orange' : 'text-tag-dim'
                )}
              >
                {availableLootboxCount}
              </p>
            </div>
          </div>
        </FadeIn>

        {/* Skins collection */}
        {userSkins.length > 0 && <SkinsCollection initialSkins={userSkins} />}

        {/* Membership row — woven in */}
        <FadeIn delay={200}>
          <MembershipCard status={membershipStatus} />
          {membershipStatus.canUpgrade && <UpgradeCard />}
          {membershipStatus.aiAmClaim?.status === 'pending' && (
            <ClaimPendingNotice claim={membershipStatus.aiAmClaim} />
          )}
        </FadeIn>

        {/* Event timeline */}
        <FadeIn delay={275}>
          <ProfileEventTimeline events={attendedEvents} />
        </FadeIn>
      </div>
    </div>
  )
}
