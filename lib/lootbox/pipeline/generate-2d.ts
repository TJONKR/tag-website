import { fal } from '@lib/fal/client'

/**
 * Generate a 2D stylized portrait using Gemini Flash via fal.ai SDK.
 * Uses the subscribe method which handles queuing and polling internally.
 */
export async function generate2dSkin(
  photoUrl: string,
  prompt: string
): Promise<string> {
  console.log('[generate-2d] Starting generation...')

  const result = await fal.subscribe('fal-ai/gemini-3.1-flash-image-preview/edit', {
    input: {
      prompt,
      image_urls: [photoUrl],
      aspect_ratio: '3:4',
      resolution: '1K',
      output_format: 'jpeg',
      seed: Math.floor(Math.random() * 10000),
    },
    logs: true,
    pollInterval: 3000,
  })

  const imageUrl = (result.data as { images?: { url: string }[] })?.images?.[0]?.url
  if (!imageUrl) {
    console.error('[generate-2d] No image in response:', JSON.stringify(result.data).slice(0, 300))
    throw new Error('2D generation failed: no image URL in response')
  }

  console.log('[generate-2d] Success:', imageUrl.substring(0, 60))
  return imageUrl
}
