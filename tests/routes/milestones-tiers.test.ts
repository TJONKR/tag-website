import { test, expect } from '@playwright/test'

import { computeTier } from '@lib/milestones/tiers'
import type { BuilderProfile } from '@lib/taste/types'
import type { OnboardingProfile } from '@lib/onboarding/types'

const emptyOnboarding: Pick<
  OnboardingProfile,
  | 'building'
  | 'why_tag'
  | 'linkedin_url'
  | 'twitter_url'
  | 'github_url'
  | 'website_url'
  | 'instagram_url'
> = {
  building: null,
  why_tag: null,
  linkedin_url: null,
  twitter_url: null,
  github_url: null,
  website_url: null,
  instagram_url: null,
}

const sparkedOnboarding = {
  ...emptyOnboarding,
  building: 'AI automation tools',
  why_tag: 'Ship faster with ambitious peers',
  linkedin_url: 'https://linkedin.com/in/someone',
}

function builderWithProphecy(
  count: 0 | 3
): Pick<BuilderProfile, 'prophecy_chosen'> {
  if (count === 0) return { prophecy_chosen: null }
  return {
    prophecy_chosen: [
      { id: 'r1-c1', round: 1, title: 'A', narrative: 'a', image_url: null },
      { id: 'r2-c1', round: 2, title: 'B', narrative: 'b', image_url: null },
      { id: 'r3-c1', round: 3, title: 'C', narrative: 'c', image_url: null },
    ],
  }
}

test.describe('computeTier()', () => {
  test('empty profile is Arrived', () => {
    const tier = computeTier({
      onboardingProfile: emptyOnboarding,
      builderProfile: null,
      photoCount: 0,
      checkedInCount: 0,
    })
    expect(tier.key).toBe('arrived')
    expect(tier.index).toBe(1)
    expect(tier.nextStep).toContain('what you')
  })

  test('building + why_tag + social lifts to Sparked', () => {
    const tier = computeTier({
      onboardingProfile: sparkedOnboarding,
      builderProfile: null,
      photoCount: 0,
      checkedInCount: 0,
    })
    expect(tier.key).toBe('sparked')
    expect(tier.index).toBe(2)
    expect(tier.nextStep).toContain('prophecy')
  })

  test('missing why_tag keeps tier at Arrived even with social', () => {
    const tier = computeTier({
      onboardingProfile: { ...sparkedOnboarding, why_tag: null },
      builderProfile: null,
      photoCount: 0,
      checkedInCount: 0,
    })
    expect(tier.key).toBe('arrived')
  })

  test('sparked + 3 chosen cards lifts to Prophecy', () => {
    const tier = computeTier({
      onboardingProfile: sparkedOnboarding,
      builderProfile: builderWithProphecy(3),
      photoCount: 0,
      checkedInCount: 0,
    })
    expect(tier.key).toBe('prophecy')
    expect(tier.index).toBe(3)
    expect(tier.nextStep).toContain('photo')
  })

  test('prophecy + 3 photos lifts to Embodied', () => {
    const tier = computeTier({
      onboardingProfile: sparkedOnboarding,
      builderProfile: builderWithProphecy(3),
      photoCount: 3,
      checkedInCount: 0,
    })
    expect(tier.key).toBe('embodied')
    expect(tier.index).toBe(4)
    expect(tier.nextStep).toContain('event')
  })

  test('embodied + check-in lifts to Present (top tier)', () => {
    const tier = computeTier({
      onboardingProfile: sparkedOnboarding,
      builderProfile: builderWithProphecy(3),
      photoCount: 5,
      checkedInCount: 1,
    })
    expect(tier.key).toBe('present')
    expect(tier.index).toBe(5)
    expect(tier.nextStep).toBeNull()
  })

  test('tier never skips: chosen cards without sparked inputs stays Arrived', () => {
    // Edge case: if someone had a deck + chose cards but then cleared their
    // socials, we should not claim they're at Prophecy.
    const tier = computeTier({
      onboardingProfile: emptyOnboarding,
      builderProfile: builderWithProphecy(3),
      photoCount: 5,
      checkedInCount: 3,
    })
    expect(tier.key).toBe('arrived')
  })
})
