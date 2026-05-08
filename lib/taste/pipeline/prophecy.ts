import Anthropic from '@anthropic-ai/sdk'

import type {
  ProphecyCard,
  ProphecyRoundIndex,
} from '../types'

export interface ProphecyProfileInput {
  headline: string | null
  bio: string | null
  tags: string[] | null
  projects: { name: string; description: string; url?: string; role?: string }[] | null
  interests: string[] | null
  notable_work: string[] | null
  influences: string[] | null
  key_links: { url: string; title: string; type: string }[] | null
}

const ROUND_BRIEFS: Record<ProphecyRoundIndex, string> = {
  1: `Round 1 · SURFACE. What patterns are visible in this member's current work? Concrete, grounded — but framed as directions they might deepen, not summaries. Think: the recurring motif an outside observer would name after reading everything they shipped.`,
  2: `Round 2 · UNDERCURRENT. Beneath the chosen surface pattern, what is actually driving it? Name the underlying urge — what are they reaching for when they pick this kind of work? Start pulling toward the abstract: qualities, relationships, tensions they keep circling.`,
  3: `Round 3 · HORIZON. The mythic / impossible version. Don't describe activities. Describe the shape of a life they might bend toward if they follow the undercurrent to its extreme. Abstract, bold, archetypal — a card that reads like a piece of personal mythology. Two-to-three-year horizon minimum.`,
}

function describePriorPicks(priorPicks: ProphecyCard[]): string {
  if (priorPicks.length === 0) return '(none — this is the first round.)'
  return priorPicks
    .map(
      (c, i) =>
        `Round ${i + 1} pick — "${c.title}": ${c.narrative}`
    )
    .join('\n')
}

function buildPrompt(
  name: string,
  profile: ProphecyProfileInput,
  priorPicks: ProphecyCard[],
  roundIndex: ProphecyRoundIndex
): string {
  return `You are The TAG Oracle. TAG is a community of builders shipping ambitious craft work. The Prophecy is a 3-round ritual: a member draws 4 cards, picks one, and the next 4 cards bend toward what they chose. Three rounds, three picks, one emerging vision.

This is round ${roundIndex} of 3.

${ROUND_BRIEFS[roundIndex]}

CARDS MUST:
- be SPECIFIC. "Something in AI" is noise. "The one-keyboard strategist" is a card.
- be DISTINCT from each other — no pair should read as two phrasings of the same idea.
- use SECOND PERSON ("you"). Direct. No LinkedIn-speak.
- avoid restating obvious biography. These are forward-looking, not resume summaries.
- for round ${roundIndex}, match the round's ${
    roundIndex === 1 ? 'SURFACE' : roundIndex === 2 ? 'UNDERCURRENT' : 'HORIZON'
  } register. A round-3 card should feel mythic; a round-1 card should feel observable.
- vary in confidence: one close-to-inevitable, one real stretch, one wild-but-plausible, one quiet/unexpected.

EACH CARD HAS:
- id: "r${roundIndex}-c1" | "r${roundIndex}-c2" | "r${roundIndex}-c3" | "r${roundIndex}-c4"
- round: ${roundIndex}
- title: "The [Something]" or similar — 2-5 words, concrete noun phrase, memorable.
- narrative: 1-2 sentences (max 280 chars), second person, forward-looking.
- image_prompt: one vivid sentence describing a single symbolic object/figure that embodies the card — to be rendered as 16-bit pixel-art gaming illustration. No text in the image. Name the key colors.

---

MEMBER NAME: ${name}

MEMBER'S CURRENT PROFILE:
${JSON.stringify(profile, null, 2)}

PRIOR PICKS IN THIS DRAW (lean on these heavily in round ${roundIndex}):
${describePriorPicks(priorPicks)}

---

Generate exactly 4 cards. Respond with ONLY valid JSON in this exact shape:

{
  "cards": [
    {"id": "r${roundIndex}-c1", "round": ${roundIndex}, "title": "...", "narrative": "...", "image_prompt": "..."},
    {"id": "r${roundIndex}-c2", "round": ${roundIndex}, "title": "...", "narrative": "...", "image_prompt": "..."},
    {"id": "r${roundIndex}-c3", "round": ${roundIndex}, "title": "...", "narrative": "...", "image_prompt": "..."},
    {"id": "r${roundIndex}-c4", "round": ${roundIndex}, "title": "...", "narrative": "...", "image_prompt": "..."}
  ]
}`
}

export interface ProphecyCardDraft {
  id: string
  round: ProphecyRoundIndex
  title: string
  narrative: string
  image_prompt: string
}

function validateRound(
  raw: unknown,
  roundIndex: ProphecyRoundIndex
): ProphecyCardDraft[] {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Prophecy generator returned non-object')
  }
  const cards = (raw as Record<string, unknown>).cards
  if (!Array.isArray(cards) || cards.length !== 4) {
    throw new Error('Prophecy round must contain exactly 4 cards')
  }
  return cards.map((c, idx) => {
    const card = c as Partial<ProphecyCardDraft>
    if (!card.title || !card.narrative || !card.image_prompt) {
      throw new Error(`Prophecy card ${idx} missing title/narrative/image_prompt`)
    }
    return {
      id: card.id ?? `r${roundIndex}-c${idx + 1}`,
      round: roundIndex,
      title: card.title,
      narrative: card.narrative,
      image_prompt: card.image_prompt,
    }
  })
}

export async function generateProphecyRound(
  name: string,
  profile: ProphecyProfileInput,
  priorPicks: ProphecyCard[],
  roundIndex: ProphecyRoundIndex
): Promise<ProphecyCardDraft[]> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    messages: [
      { role: 'user', content: buildPrompt(name, profile, priorPicks, roundIndex) },
    ],
  })

  const textBlock = response.content.find(
    (b): b is Anthropic.Messages.TextBlock => b.type === 'text'
  )
  if (!textBlock) {
    throw new Error('Prophecy generator returned no text')
  }

  let jsonStr = textBlock.text.trim()
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (jsonMatch) jsonStr = jsonMatch[1].trim()

  return validateRound(JSON.parse(jsonStr), roundIndex)
}
