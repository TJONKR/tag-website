#!/usr/bin/env tsx
/**
 * Prophecy prompt R&D — phase 0 of the milestones-and-prophecy plan.
 *
 * Reads a member's existing `builder_profiles` row and prompts Claude to
 * generate a tarot-like deck of forward-looking cards. No DB writes, no
 * pipeline integration — just a standalone testbed for iterating on
 * prompt quality before any UI work.
 *
 * Usage:
 *   pnpm tsx scripts/prophecy-prompt-test.ts <email|name>
 *
 * Examples:
 *   pnpm tsx scripts/prophecy-prompt-test.ts tijs@lerai.nl
 *   pnpm tsx scripts/prophecy-prompt-test.ts "Tijs Nieuwboer"
 *
 * Reads from .env.local: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 * ANTHROPIC_API_KEY. NEXT_PUBLIC_SUPABASE_URL is used as a fallback
 * for SUPABASE_URL.
 */

import 'dotenv/config'
import { config as loadDotenv } from 'dotenv'
import path from 'path'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

// Prefer .env.local (same as Next.js dev)
loadDotenv({ path: path.resolve(process.cwd(), '.env.local'), override: true })

const SUPABASE_URL =
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    'Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in .env.local'
  )
  process.exit(1)
}
if (!ANTHROPIC_API_KEY) {
  console.error('Missing ANTHROPIC_API_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY })

type Suit = 'field' | 'method' | 'audience' | 'arc'

interface ProphecyCard {
  id: string
  suit: Suit
  title: string
  narrative: string
}

interface ProphecyDeck {
  field: ProphecyCard[]
  method: ProphecyCard[]
  audience: ProphecyCard[]
  arc: ProphecyCard[]
}

interface BuilderProfileRow {
  headline: string | null
  bio: string | null
  tags: string[] | null
  projects:
    | { name: string; description: string; url?: string; role?: string }[]
    | null
  interests: string[] | null
  notable_work: string[] | null
  influences: string[] | null
  key_links: { url: string; title: string; type: string }[] | null
}

async function findUser(
  arg: string
): Promise<{ id: string; email: string; name: string | null } | null> {
  // Try by email first
  if (arg.includes('@')) {
    const { data } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
    const user = data.users.find((u) => u.email === arg)
    if (!user) return null
    const { data: profile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', user.id)
      .maybeSingle()
    return { id: user.id, email: user.email ?? '', name: profile?.name ?? null }
  }

  // Otherwise by name (ilike match on profiles)
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, name')
    .ilike('name', arg)
    .limit(1)
    .maybeSingle()
  if (!profile) return null
  return { id: profile.id, email: '', name: profile.name }
}

async function loadBuilderProfile(
  userId: string
): Promise<BuilderProfileRow | null> {
  const { data } = await supabase
    .from('builder_profiles')
    .select(
      'headline, bio, tags, projects, interests, notable_work, influences, key_links'
    )
    .eq('user_id', userId)
    .eq('status', 'complete')
    .maybeSingle()
  return (data as BuilderProfileRow | null) ?? null
}

function buildPrompt(name: string, profile: BuilderProfileRow): string {
  return `You are a TAG Oracle. Your job is to generate a tarot-like deck of forward-looking cards about a member based on their current profile.

TAG is a community of builders, operators, and creators. Its tagline is "To Achieve Greatness." Members are ambitious, craft-obsessed, often shipping in public. The Prophecy is a ritual where a member draws cards that suggest where they might be headed.

The deck should feel:
- SPECIFIC, not generic. "You will build something AI-powered" is useless. "You'll build the tool that gets 10,000 non-technical founders their first shipped product" is a card.
- GROUNDED in their current work — but PROJECTING forward. These are predictions, not summaries.
- DISTINCT per card — no two cards in the same suit should overlap or feel like variations of each other.
- VARIED in confidence — mix grounded predictions (feels close to inevitable) with bolder ones (a real stretch) and a few wild cards (unexpected but plausible).
- FORWARD in time — imagine a world 2-3 years out. The member looks back; which of these came true?
- TAG-VOICED — direct, ambitious, no fluff, no LinkedIn-speak.

Suits (4 suits, 3-4 cards each, 14 cards total):

1. **Field** — the domain they'll own. What are they going to be known for working ON? (e.g. "The Voice-First Pioneer", "The Keyboard Killer")

2. **Method** — how they'll work. Their signature move, the way they operate. (e.g. "The Public Shipper", "The Hackathon Machine")

3. **Audience** — who they'll serve. The specific group whose problem they solve. (e.g. "The Non-Coder's Advocate", "The Agency Liberator")

4. **Arc** — the bigger shape. Where does this all lead? What's the 2-3 year trajectory? (e.g. "The Studio Founder", "The Infrastructure Builder", "The Movement Leader")

Each card has:
- id: "{suit}-{index}" (e.g. "field-1", "field-2", "method-1")
- suit: "field" | "method" | "audience" | "arc"
- title: "The [Something]" — 2-5 words max. Concrete noun phrase. Memorable.
- narrative: 1-2 sentences (max 280 chars). Direct, forward-looking, specific. Use "you" (second person).

---

MEMBER NAME: ${name}

MEMBER'S CURRENT PROFILE:
${JSON.stringify(profile, null, 2)}

---

Generate a deck of 14 cards (3-4 per suit). Respond with ONLY valid JSON in this exact shape:

{
  "field": [{"id": "field-1", "suit": "field", "title": "...", "narrative": "..."}, ...],
  "method": [...],
  "audience": [...],
  "arc": [...]
}`
}

async function generateProphecy(
  name: string,
  profile: BuilderProfileRow
): Promise<ProphecyDeck> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    messages: [{ role: 'user', content: buildPrompt(name, profile) }],
  })

  const textBlock = response.content.find((b) => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text block in response')
  }

  let jsonStr = textBlock.text.trim()
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (jsonMatch) jsonStr = jsonMatch[1].trim()

  return JSON.parse(jsonStr) as ProphecyDeck
}

function printDeck(deck: ProphecyDeck) {
  const suits: Suit[] = ['field', 'method', 'audience', 'arc']
  const suitLabels: Record<Suit, string> = {
    field: 'THE FIELD — what you\'ll own',
    method: 'THE METHOD — how you\'ll work',
    audience: 'THE AUDIENCE — who you\'ll serve',
    arc: 'THE ARC — where this leads',
  }

  for (const suit of suits) {
    const cards = deck[suit] ?? []
    console.log('\n' + '━'.repeat(72))
    console.log(suitLabels[suit])
    console.log('━'.repeat(72))
    for (const card of cards) {
      console.log(`\n  ◆  ${card.title}`)
      console.log(`     ${card.narrative}`)
    }
  }
  console.log('\n' + '━'.repeat(72))
}

async function main() {
  const arg = process.argv[2]
  if (!arg) {
    console.error('Usage: pnpm tsx scripts/prophecy-prompt-test.ts <email|name>')
    process.exit(1)
  }

  console.log(`Looking up: ${arg}`)
  const user = await findUser(arg)
  if (!user) {
    console.error(`No member found matching "${arg}"`)
    process.exit(1)
  }
  console.log(`Found: ${user.name ?? '(no name)'} [${user.id}]`)

  const profile = await loadBuilderProfile(user.id)
  if (!profile) {
    console.error(
      'No completed builder_profile for this user. Run the taste pipeline first.'
    )
    process.exit(1)
  }

  console.log(`\nGenerating prophecy deck (Sonnet 4.6)…\n`)
  const deck = await generateProphecy(user.name ?? 'Member', profile)

  printDeck(deck)

  // Also dump raw JSON at the end so it can be piped / saved
  const jsonOut = `\n\n--- RAW JSON ---\n${JSON.stringify(deck, null, 2)}`
  console.log(jsonOut)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
