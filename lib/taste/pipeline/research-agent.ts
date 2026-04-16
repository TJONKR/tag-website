import Anthropic from '@anthropic-ai/sdk'

import { updateEvaluationStatus } from '../mutations'

import type { VerifiedData, StatusData } from './types'
import {
  scrapeTwitter,
  scrapeLinkedIn,
  scrapeWebsite,
  scrapeGitHub,
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
  let twitterData: TwitterData | null = null

  const inputLines = [`Name: ${name}`]
  if (twitter) inputLines.push(`Twitter/X: ${twitter}`)
  if (linkedin) inputLines.push(`LinkedIn: ${linkedin}`)
  if (website) inputLines.push(`Website: ${website}`)
  if (description) inputLines.push(`Self-description: ${description}`)

  const systemPrompt = `You are a research agent for TAG — a community of builders.

Your job: build a focused dossier on "${name}" so we can write a good builder profile.
Tools: scrape Twitter, LinkedIn, websites, GitHub, plus web search.

STRATEGY (be efficient, don't over-research):
1. Scrape the provided profiles first (Twitter, LinkedIn, website, and GitHub if relevant).
2. Do 1-3 targeted web searches only if the scrape data is thin or you spot a clear lead worth following.
3. Call the "done" tool as soon as you have enough to write a solid profile.

QUALITY:
- Verify content actually belongs to this person.
- Aim for 3-6 tool calls total. Don't repeat searches or scrape the same URL twice.
- Skip searches if the provided profiles already give you a clear picture.

OUTPUT: Call "done" with a JSON object matching VerifiedData: name, confidence, excludedSources, twitter, linkedin, website, selfDescription, webResearch, researcherNotes.`

  const messages: Anthropic.Messages.MessageParam[] = [
    {
      role: 'user',
      content: `Research this person:\n\n${inputLines.join('\n')}`,
    },
  ]

  await updateEvaluationStatus(userId, 'researching', 'Starting research...')

  let iterations = 0
  const MAX_ITERATIONS = 8

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
          return buildResult(result, twitterData, stats, name, twitter)
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
        return buildResult(input.result, twitterData, stats, name, twitter)
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
    default:
      return `Running ${toolName}`
  }
}

function buildResult(
  verifiedData: any,
  twitterData: TwitterData | null,
  stats: StatusData,
  name: string,
  twitter?: string
): ResearchResult {
  const avatarUrl = getAvatarUrl(name, twitterData?.avatarUrl, twitter)

  return {
    verifiedData: verifiedData as VerifiedData,
    twitterData,
    avatarUrl,
    stats,
  }
}
