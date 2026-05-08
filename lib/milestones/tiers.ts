import type { BuilderProfile } from '@lib/taste/types'
import type { OnboardingProfile } from '@lib/onboarding/types'

export type TierKey = 'arrived' | 'sparked' | 'prophecy' | 'embodied' | 'present'

export interface TierMeta {
  key: TierKey
  index: number // 1-5
  label: string
  tagline: string
  /** One-line hint explaining how to advance to the next tier. Null if on the top tier. */
  nextStep: string | null
}

interface TierInputs {
  onboardingProfile: Pick<
    OnboardingProfile,
    | 'building'
    | 'why_tag'
    | 'linkedin_url'
    | 'twitter_url'
    | 'github_url'
    | 'website_url'
    | 'instagram_url'
  >
  builderProfile: Pick<BuilderProfile, 'prophecy_chosen'> | null
  photoCount: number
  checkedInCount: number
}

const TIER_LABELS: Record<TierKey, { label: string; tagline: string }> = {
  arrived: { label: 'Arrived', tagline: 'You made it inside.' },
  sparked: { label: 'Sparked', tagline: 'The oracle is reading you.' },
  prophecy: { label: 'Prophecy', tagline: 'Your arc is on the wall.' },
  embodied: { label: 'Embodied', tagline: 'You gave TAG a face.' },
  present: { label: 'Present', tagline: 'You showed up in person.' },
}

export function computeTier(inputs: TierInputs): TierMeta {
  const { onboardingProfile, builderProfile, photoCount, checkedInCount } = inputs

  const hasBuildingAndWhy = Boolean(
    onboardingProfile.building?.trim() && onboardingProfile.why_tag?.trim()
  )
  const hasSocial = Boolean(
    onboardingProfile.linkedin_url ||
      onboardingProfile.twitter_url ||
      onboardingProfile.github_url ||
      onboardingProfile.website_url ||
      onboardingProfile.instagram_url
  )
  const sparked = hasBuildingAndWhy && hasSocial
  const prophecyDone = Boolean(
    builderProfile?.prophecy_chosen && builderProfile.prophecy_chosen.length === 3
  )
  const embodied = photoCount >= 3
  const present = checkedInCount >= 1

  let key: TierKey = 'arrived'
  if (sparked) key = 'sparked'
  if (sparked && prophecyDone) key = 'prophecy'
  if (sparked && prophecyDone && embodied) key = 'embodied'
  if (sparked && prophecyDone && embodied && present) key = 'present'

  let nextStep: string | null = null
  if (key === 'arrived') {
    nextStep = 'Fill what you\u2019re building, why TAG, and one social link.'
  } else if (key === 'sparked') {
    nextStep = 'Draw your prophecy when the cards appear on Identity.'
  } else if (key === 'prophecy') {
    nextStep = `Upload ${Math.max(0, 3 - photoCount)} more photo${photoCount === 2 ? '' : 's'} to unlock your lootbox.`
  } else if (key === 'embodied') {
    nextStep = 'Check in at a TAG event to reach Present.'
  }

  const meta = TIER_LABELS[key]
  return {
    key,
    index: ({ arrived: 1, sparked: 2, prophecy: 3, embodied: 4, present: 5 } as const)[
      key
    ],
    label: meta.label,
    tagline: meta.tagline,
    nextStep,
  }
}
