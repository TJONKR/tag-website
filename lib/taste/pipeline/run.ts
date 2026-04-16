import {
  updateEvaluationStatus,
  saveProfileResult,
  setEvaluationError,
} from '../mutations'

import { runResearchAgent } from './research-agent'
import { formatProfile } from './formatter'

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
  }
}
