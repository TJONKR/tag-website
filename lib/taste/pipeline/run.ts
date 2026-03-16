import {
  updateEvaluationStatus,
  saveProfileResult,
  saveSkinResult,
  setEvaluationError,
} from '../mutations'

import { runResearchAgent } from './research-agent'
import { formatProfile } from './formatter'
import { generateSkin } from './skin'

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
  const { userId, name, twitterUrl, linkedinUrl, githubUrl, websiteUrl, building } =
    input

  try {
    // Phase 1: Research Agent (unchanged)
    console.log(`[profile-pipeline] Starting research for ${name}...`)
    const research = await runResearchAgent(
      userId,
      name,
      twitterUrl || undefined,
      linkedinUrl || undefined,
      websiteUrl || undefined,
      building || undefined
    )

    // Phase 2: Profile Formatter
    console.log(`[profile-pipeline] Formatting profile...`)
    await updateEvaluationStatus(userId, 'formatting', 'Building your profile...')

    const profile = await formatProfile(name, research.verifiedData)

    // Save results (sets status to 'generating_skin')
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

    // Phase 3: Skin Generation
    console.log(`[profile-pipeline] Generating skin for ${name}...`)
    await updateEvaluationStatus(userId, 'generating_skin', 'Generating your skin...')

    try {
      const skinUrl = await generateSkin({
        headline: profile.headline,
        tags: profile.tags,
        interests: profile.interests,
        bio: profile.bio,
      })
      await saveSkinResult(userId, skinUrl)
      console.log(`[profile-pipeline] Skin generated for ${name}!`)
    } catch (skinError) {
      console.error(`[profile-pipeline] Skin generation failed for ${name}:`, skinError)
      // Don't block profile completion — complete without skin
      await saveSkinResult(userId, null)
    }

    console.log(`[profile-pipeline] Complete for ${name}!`)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error(`[profile-pipeline] Error for ${name}:`, message)
    await setEvaluationError(userId, message)
  }
}
