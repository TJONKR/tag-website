import Anthropic from '@anthropic-ai/sdk'

import type { VerifiedData, FormattedProfile } from './types'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function formatProfile(
  name: string,
  verifiedData: VerifiedData
): Promise<FormattedProfile> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: `You are a profile writer for TAG — a community of builders, operators, and creators who build the future. Your job is to take research data about a person and extract a structured profile.

Write in a confident, direct tone. No fluff. Celebrate what's real — their work, their projects, their taste. Don't invent facts. If the research data doesn't support a field, leave the array empty or the string minimal.

TAG values taste, craft, and conviction. The profile should reflect what makes this person interesting as a builder.`,
    messages: [
      {
        role: 'user',
        content: `Here is the research dossier on ${name}:

${JSON.stringify(verifiedData, null, 2)}

Extract a structured profile with these fields:

1. **headline** — One-line description of who they are and what they do (e.g. "AI engineer building autonomous agents" or "Design director obsessed with spatial interfaces"). Max 80 chars.

2. **bio** — 2-3 paragraphs about who they are, what they build, and what drives them. Written in third person. Pull from real data — tweets, posts, projects. Make it vivid but factual.

3. **tags** — 3-8 topic tags that define their domain (e.g. ["AI", "TypeScript", "Open Source", "Design Systems"]). Only include tags supported by the research.

4. **projects** — Array of notable projects/companies they work on. Each has: name, description (1-2 sentences), url (if found), role (if known). Max 5.

5. **interests** — What they're curious about beyond their main work. Pull from starred repos, retweets, side interests. Max 6.

6. **notable_work** — Key achievements, talks, articles, or contributions. Things that stand out. Max 5.

7. **influences** — People, books, ideas, or movements that shaped them (if detectable from their content). Max 5.

8. **key_links** — The most important/interesting links found during research. Each has: url, title, type (e.g. "twitter", "github", "article", "project", "website"). Max 8.

Respond with ONLY valid JSON matching this exact structure:
{
  "headline": "string",
  "bio": "string",
  "tags": ["string"],
  "projects": [{"name": "string", "description": "string", "url": "string", "role": "string"}],
  "interests": ["string"],
  "notable_work": ["string"],
  "influences": ["string"],
  "key_links": [{"url": "string", "title": "string", "type": "string"}]
}`,
      },
    ],
  })

  const textBlock = response.content.find(
    (b): b is Anthropic.Messages.TextBlock => b.type === 'text'
  )

  if (!textBlock) {
    throw new Error('Profile formatter returned no text')
  }

  // Extract JSON from the response (handle potential markdown code blocks)
  let jsonStr = textBlock.text.trim()
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim()
  }

  const parsed = JSON.parse(jsonStr) as FormattedProfile

  // Validate required fields
  if (!parsed.headline || !parsed.bio) {
    throw new Error('Profile formatter missing required fields (headline, bio)')
  }

  return {
    headline: parsed.headline,
    bio: parsed.bio,
    tags: parsed.tags || [],
    projects: parsed.projects || [],
    interests: parsed.interests || [],
    notable_work: parsed.notable_work || [],
    influences: parsed.influences || [],
    key_links: parsed.key_links || [],
  }
}
