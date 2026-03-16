import Anthropic from '@anthropic-ai/sdk'

import { updateEvaluationStatus } from '../mutations'

import type { VerifiedData, ScreenshotImage, StatusData } from './types'
import {
  scrapeTwitter,
  scrapeLinkedIn,
  scrapeWebsite,
  scrapeGitHub,
  fetchYouTubeTranscript,
  fetchScreenshotAsBase64,
  getScreenshotUrl,
  getAvatarUrl,
  type TwitterData,
} from './scrape'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const TOOLS: Anthropic.Messages.Tool[] = [
  {
    name: 'scrape_twitter',
    description:
      'Scrape recent tweets from a Twitter/X account. Returns profile info and up to 200 tweets with engagement metrics.',
    input_schema: {
      type: 'object' as const,
      properties: {
        handle: {
          type: 'string',
          description: "Twitter handle (e.g. 'karpathy' or '@karpathy')",
        },
      },
      required: ['handle'],
    },
  },
  {
    name: 'scrape_linkedin',
    description:
      'Scrape a LinkedIn profile\'s posts and headline. Returns up to 30 posts with engagement data.',
    input_schema: {
      type: 'object' as const,
      properties: {
        url: {
          type: 'string',
          description: 'Full LinkedIn profile URL',
        },
      },
      required: ['url'],
    },
  },
  {
    name: 'scrape_website',
    description:
      'Fetch and extract text content from any URL. Returns up to 8000 characters of cleaned text.',
    input_schema: {
      type: 'object' as const,
      properties: {
        url: { type: 'string', description: 'URL to scrape' },
      },
      required: ['url'],
    },
  },
  {
    name: 'scrape_github',
    description:
      'Fetch a GitHub user\'s profile, top repositories, and starred repositories.',
    input_schema: {
      type: 'object' as const,
      properties: {
        username: {
          type: 'string',
          description: 'GitHub username or profile URL',
        },
      },
      required: ['username'],
    },
  },
  {
    name: 'fetch_youtube_transcript',
    description:
      'Fetch the transcript/captions of a YouTube video. Returns up to 10000 characters.',
    input_schema: {
      type: 'object' as const,
      properties: {
        video_url: { type: 'string', description: 'YouTube video URL' },
      },
      required: ['video_url'],
    },
  },
  {
    name: 'capture_screenshot',
    description:
      'Capture a visual screenshot of a webpage for later vision analysis.',
    input_schema: {
      type: 'object' as const,
      properties: {
        url: { type: 'string', description: 'URL to screenshot' },
        label: {
          type: 'string',
          description: "Short label (e.g. 'Website', 'Twitter Profile')",
        },
      },
      required: ['url', 'label'],
    },
  },
  {
    name: 'done',
    description:
      'Call when you have gathered enough data. Pass the final VerifiedData JSON.',
    input_schema: {
      type: 'object' as const,
      properties: {
        result: { type: 'object', description: 'The final VerifiedData JSON' },
      },
      required: ['result'],
    },
  },
]

async function executeTool(name: string, input: any): Promise<string> {
  try {
    switch (name) {
      case 'scrape_twitter': {
        const data = await scrapeTwitter(input.handle)
        return JSON.stringify(data)
      }
      case 'scrape_linkedin': {
        const data = await scrapeLinkedIn(input.url)
        return JSON.stringify(data)
      }
      case 'scrape_website': {
        const text = await scrapeWebsite(input.url)
        return text
      }
      case 'scrape_github': {
        const data = await scrapeGitHub(input.username)
        return JSON.stringify(data)
      }
      case 'fetch_youtube_transcript': {
        const data = await fetchYouTubeTranscript(input.video_url)
        if (!data)
          return JSON.stringify({
            error: 'Could not fetch transcript — video may not have captions',
          })
        return JSON.stringify(data)
      }
      case 'capture_screenshot': {
        const result = await fetchScreenshotAsBase64(input.url)
        if (!result) return JSON.stringify({ error: 'Failed to capture screenshot' })
        return JSON.stringify({
          success: true,
          label: input.label,
          sizeKB: Math.round(
            Buffer.from(result.base64, 'base64').length / 1024
          ),
        })
      }
      default:
        return JSON.stringify({ error: `Unknown tool: ${name}` })
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return JSON.stringify({ error: message })
  }
}

export interface ResearchResult {
  verifiedData: VerifiedData
  twitterData: TwitterData | null
  screenshots: { url: string; source: string }[]
  screenshotImages: ScreenshotImage[]
  avatarUrl: string
  stats: StatusData
}

export async function runResearchAgent(
  userId: string,
  name: string,
  twitter?: string,
  linkedin?: string,
  website?: string,
  description?: string
): Promise<ResearchResult> {
  const stats: StatusData = { dataSources: [] }
  const screenshots: { url: string; source: string }[] = []
  const screenshotImages: ScreenshotImage[] = []
  let twitterData: TwitterData | null = null

  const inputLines = [`Name: ${name}`]
  if (twitter) inputLines.push(`Twitter/X: ${twitter}`)
  if (linkedin) inputLines.push(`LinkedIn: ${linkedin}`)
  if (website) inputLines.push(`Website: ${website}`)
  if (description) inputLines.push(`Self-description: ${description}`)

  const systemPrompt = `You are a deep research agent for The Taste Bench — the internet's taste evaluation platform.

Your job is to build a comprehensive dossier on "${name}" by scraping their digital presence and researching them online. You have tools to scrape Twitter, LinkedIn, websites, GitHub, fetch YouTube transcripts, search the web, and capture screenshots.

RESEARCH STRATEGY (follow this order strictly):
PHASE 1 — SCRAPE: Start by scraping the provided profiles (Twitter, LinkedIn, website). If they're a tech person, scrape their GitHub too (starred repos reveal taste!). Do ONLY scraping in this phase — no web searches yet.
PHASE 2 — ASSESS: After seeing the scrape results, check the Twitter dateRangeSummary. If tweets span less than 90 days, you MUST do 3+ web searches for historical content.
PHASE 3 — GET TO KNOW THEM: Do 4-8 web searches across influences, interviews, creative output, strong positions, and what others say. Follow leads — if you find YouTube videos, FETCH THE TRANSCRIPT.
PHASE 4 — VISUAL: Capture screenshots of their most visually interesting pages.
PHASE 5 — DONE: Call the "done" tool with a comprehensive VerifiedData JSON.

QUALITY STANDARDS:
- Verify content ownership — make sure scraped content actually belongs to this person
- Separate tweets into original/retweets/quote tweets
- Flag notable content — unusual takes, revealing statements, strong opinions
- Aim for 8-12 tool calls minimum
- Be cost-efficient: don't repeat searches or scrape the same URL twice

OUTPUT: When done, call the "done" tool with a JSON object matching the VerifiedData structure with fields: name, confidence, excludedSources, twitter, linkedin, website, selfDescription, webResearch, researcherNotes.`

  const messages: Anthropic.Messages.MessageParam[] = [
    {
      role: 'user',
      content: `Research this person:\n\n${inputLines.join('\n')}`,
    },
  ]

  await updateEvaluationStatus(userId, 'researching', 'Starting research...')

  let iterations = 0
  const MAX_ITERATIONS = 15

  while (iterations < MAX_ITERATIONS) {
    iterations++

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8192,
      system: systemPrompt,
      tools: [
        ...TOOLS,
        { type: 'web_search_20250305' as const, name: 'web_search' },
      ],
      messages,
    })

    // Track server-side web searches
  
    const serverToolBlocks = response.content.filter(
      (b: any) => b.type === 'server_tool_use'
    )
    for (const stb of serverToolBlocks) {
    
      const query = (stb as any).input?.query
      if (query) {
        console.log(`[research-agent] Web search: ${query}`)
        await updateEvaluationStatus(
          userId,
          'researching',
          `Searching: ${query}`
        )
      }
    }

    const toolUseBlocks = response.content.filter(
      (b): b is Anthropic.Messages.ToolUseBlock => b.type === 'tool_use'
    )

    if (toolUseBlocks.length === 0) {
      if (serverToolBlocks.length > 0) {
        messages.push({ role: 'assistant', content: response.content })
        messages.push({
          role: 'user',
          content:
            "Continue your research. Use the tools to gather more data or call 'done' when you have enough.",
        })
        continue
      }
      const textBlock = response.content.find(
        (b): b is Anthropic.Messages.TextBlock => b.type === 'text'
      )
      if (textBlock) {
        try {
          const result = JSON.parse(textBlock.text)
          return buildResult(
            result,
            twitterData,
            screenshots,
            screenshotImages,
            stats,
            name,
            twitter
          )
        } catch {
          // couldn't parse text output
        }
      }
      break
    }

    const toolResults: Anthropic.Messages.ToolResultBlockParam[] = []

    for (const toolUse of toolUseBlocks) {
    
      const input = toolUse.input as any

      if (toolUse.name === 'done') {
        console.log(`[research-agent] Done after ${iterations} iterations`)
        return buildResult(
          input.result,
          twitterData,
          screenshots,
          screenshotImages,
          stats,
          name,
          twitter
        )
      }

      const statusLabel = getStatusLabel(toolUse.name, input)
      console.log(`[research-agent] ${statusLabel}`)
      await updateEvaluationStatus(userId, 'researching', statusLabel)

      const result = await executeTool(toolUse.name, input)

      if (toolUse.name === 'scrape_twitter') {
        try {
          const data = JSON.parse(result)
          twitterData = data
          stats.tweetCount = data.tweets?.length || 0
          stats.dataSources = Array.from(
            new Set([...(stats.dataSources || []), 'twitter'])
          )
        } catch {
          // ignore parse errors
        }
      }
      if (toolUse.name === 'scrape_linkedin') {
        try {
          const data = JSON.parse(result)
          stats.linkedinPostCount = data.posts?.length || 0
          stats.dataSources = Array.from(
            new Set([...(stats.dataSources || []), 'linkedin'])
          )
        } catch {
          // ignore parse errors
        }
      }
      if (toolUse.name === 'scrape_website') {
        stats.dataSources = Array.from(
          new Set([...(stats.dataSources || []), 'website'])
        )
      }
      if (toolUse.name === 'scrape_github') {
        stats.dataSources = Array.from(
          new Set([...(stats.dataSources || []), 'github'])
        )
      }
      if (toolUse.name === 'fetch_youtube_transcript') {
        stats.dataSources = Array.from(
          new Set([...(stats.dataSources || []), 'youtube'])
        )
      }
      if (toolUse.name === 'capture_screenshot') {
        const screenshotData = await fetchScreenshotAsBase64(input.url)
        if (screenshotData) {
          screenshotImages.push({
            source: input.label || 'Page',
            base64: screenshotData.base64,
            mediaType: screenshotData.mediaType,
          })
          screenshots.push({
            url: getScreenshotUrl(input.url),
            source: input.label || 'Page',
          })
          stats.screenshotsCaptured = screenshotImages.length
        }
      }

      toolResults.push({
        type: 'tool_result',
        tool_use_id: toolUse.id,
        content: result,
      })
    }

    messages.push({ role: 'assistant', content: response.content })
    messages.push({ role: 'user', content: toolResults })
  }

  throw new Error(
    'Research agent exceeded maximum iterations without producing results'
  )
}

function getStatusLabel(toolName: string, input: any): string {
  switch (toolName) {
    case 'scrape_twitter':
      return `Scraping @${(input.handle || '').replace('@', '')} on X`
    case 'scrape_linkedin':
      return `Scraping LinkedIn profile`
    case 'scrape_website':
      try {
        return `Scraping ${new URL(input.url).hostname}`
      } catch {
        return `Scraping website`
      }
    case 'scrape_github':
      return `Scraping GitHub: ${(input.username || '').replace(/.*github\.com\//, '')}`
    case 'fetch_youtube_transcript':
      return `Fetching YouTube transcript`
    case 'capture_screenshot':
      return `Capturing screenshot: ${input.label || input.url}`
    default:
      return `Running ${toolName}`
  }
}

function buildResult(

  verifiedData: any,
  twitterData: TwitterData | null,
  screenshots: { url: string; source: string }[],
  screenshotImages: ScreenshotImage[],
  stats: StatusData,
  name: string,
  twitter?: string
): ResearchResult {
  const avatarUrl = getAvatarUrl(name, twitterData?.avatarUrl, twitter)

  return {
    verifiedData: verifiedData as VerifiedData,
    twitterData,
    screenshots,
    screenshotImages,
    avatarUrl,
    stats,
  }
}
