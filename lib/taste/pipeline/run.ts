import {
  updateEvaluationStatus,
  saveProfileResult,
  setEvaluationError,
  startProphecyDraw,
} from '../mutations'

import { runResearchAgent } from './research-agent'
import { formatProfile } from './formatter'
import { generateProphecyRound } from './prophecy'
import { attachImages } from './prophecy-image'

import type { ProphecyRound } from '../types'

interface PipelineInput {
  userId: string
  name: string
  twitterUrl?: string | null
  linkedinUrl?: string | null
  githubUrl?: string | null
  websiteUrl?: string | null
  building?: string | null
}

export async function runProfilePipeline(input: PipelineInput): Promise<void> {
  const { userId, name, twitterUrl, linkedinUrl, websiteUrl, building } = input

  let savedProfile: Awaited<ReturnType<typeof formatProfile>> | null = null

  try {
    // Phase 1: Research
    console.log(`[profile-pipeline] Starting research for ${name}...`)
    const research = await runResearchAgent(
      userId,
      name,
      twitterUrl || undefined,
      linkedinUrl || undefined,
      websiteUrl || undefined,
      building || undefined
    )

    // Phase 2: Format + save (status flips to 'complete' inside saveProfileResult)
    console.log(`[profile-pipeline] Formatting profile...`)
    await updateEvaluationStatus(userId, 'formatting', 'Building your profile...')

    const profile = await formatProfile(name, research.verifiedData)
    savedProfile = profile

    console.log(`[profile-pipeline] Saving profile...`)
    await saveProfileResult(userId, {
      headline: profile.headline,
      bio: profile.bio,
      tags: profile.tags,
      projects: profile.projects,
      interests: profile.interests,
      notableWork: profile.notable_work,
      influences: profile.influences,
      keyLinks: profile.key_links,
      dataSources: research.stats.dataSources || [],
      avatarUrl: research.avatarUrl,
    })

    console.log(`[profile-pipeline] Complete for ${name}!`)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error(`[profile-pipeline] Error for ${name}:`, message)
    await setEvaluationError(userId, message)
    return
  }

  // Phase 3: Pre-generate prophecy round 1 so the member's first tap on
  // "Draw the cards" opens instantly instead of waiting ~20s for the
  // round-1 LLM call + image generation. Non-fatal — a prophecy failure
  // doesn't wipe the profile. If this fails, the /draw endpoint will
  // generate on demand as a fallback.
  try {
    if (!savedProfile) return
    console.log(`[profile-pipeline] Pre-generating prophecy round 1 for ${name}...`)
    const drafts = await generateProphecyRound(
      name,
      {
        headline: savedProfile.headline,
        bio: savedProfile.bio,
        tags: savedProfile.tags,
        projects: savedProfile.projects,
        interests: savedProfile.interests,
        notable_work: savedProfile.notable_work,
        influences: savedProfile.influences,
        key_links: savedProfile.key_links,
      },
      [],
      1
    )
    const cards = await attachImages(userId, drafts)
    const firstRound: ProphecyRound = { cards, picked_id: null }
    await startProphecyDraw(userId, firstRound)
    console.log(`[profile-pipeline] Prophecy round 1 ready for ${name}.`)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error(`[profile-pipeline] Prophecy pre-gen failed for ${name}:`, message)
    // Non-fatal. /api/taste/prophecy/draw will generate on demand.
  }
}
