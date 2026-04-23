import { createServiceRoleClient } from '@lib/db'

import type { ProphecyCard } from '../types'
import type { ProphecyCardDraft } from './prophecy'

const FAL_ENDPOINT = 'https://fal.run/fal-ai/flux/schnell'
const BUCKET = 'prophecy-images'

const STYLE_PROMPT =
  '16-bit SNES-era fantasy RPG card illustration, pixel art, dithered, single centered symbolic figure on dark mystical background, rich shadows, burnt orange and deep violet highlights, painterly but pixelated, no text, no watermark, no border, centered composition'

interface FalResponse {
  images?: { url: string }[]
}

async function callFal(prompt: string): Promise<string> {
  const key = process.env.FAL_KEY
  if (!key) throw new Error('FAL_KEY is not set')

  const res = await fetch(FAL_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Key ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: `${STYLE_PROMPT}. ${prompt}`,
      image_size: 'square_hd',
      num_images: 1,
      enable_safety_checker: false,
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`fal.ai request failed: ${res.status} ${text}`)
  }

  const json = (await res.json()) as FalResponse
  const url = json.images?.[0]?.url
  if (!url) throw new Error('fal.ai response missing image url')
  return url
}

async function uploadToStorage(
  userId: string,
  cardId: string,
  sourceUrl: string
): Promise<string> {
  const supabase = createServiceRoleClient()
  const imgRes = await fetch(sourceUrl)
  if (!imgRes.ok) {
    throw new Error(`Failed to fetch generated image: ${imgRes.status}`)
  }
  const blob = await imgRes.arrayBuffer()

  const path = `${userId}/${cardId}-${Date.now()}.png`
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, { contentType: 'image/png', upsert: false })

  if (error) throw new Error(`prophecy-images upload failed: ${error.message}`)

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}

export async function generateCardImage(
  userId: string,
  cardId: string,
  imagePrompt: string
): Promise<string> {
  const falUrl = await callFal(imagePrompt)
  return await uploadToStorage(userId, cardId, falUrl)
}

/**
 * Turn drafts from the LLM (which carry image_prompt) into finished
 * ProphecyCards with image_url populated. Generation runs in parallel;
 * a single image failure degrades gracefully to image_url=null so the
 * round still renders.
 */
export async function attachImages(
  userId: string,
  drafts: ProphecyCardDraft[]
): Promise<ProphecyCard[]> {
  const results = await Promise.allSettled(
    drafts.map((d) => generateCardImage(userId, d.id, d.image_prompt))
  )
  return drafts.map((d, i) => {
    const r = results[i]
    const image_url = r.status === 'fulfilled' ? r.value : null
    if (r.status === 'rejected') {
      console.error(`[prophecy-image] ${d.id} failed:`, r.reason)
    }
    return {
      id: d.id,
      round: d.round,
      title: d.title,
      narrative: d.narrative,
      image_url,
    }
  })
}
