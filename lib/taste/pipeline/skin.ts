import { fal, FAL_MODELS } from '@lib/fal/client'

interface GenerateSkinInput {
  headline: string
  tags: string[]
  interests: string[]
  bio: string
}

export async function generateSkin(input: GenerateSkinInput): Promise<string> {
  const domain = input.tags.slice(0, 3).join(', ')
  const vibes = input.interests.slice(0, 3).join(', ')

  const prompt = [
    'Stylized character portrait, dark moody background, orange accent lighting.',
    `The character embodies: ${domain}.`,
    `Aesthetic vibes: ${vibes}.`,
    `Essence: ${input.headline}.`,
    'Digital art, painterly style, cinematic composition, no text, no watermarks.',
  ].join(' ')

  const result = await fal.subscribe(FAL_MODELS.image.flux, {
    input: {
      prompt,
      image_size: 'portrait_4_3' as const,
      num_images: 1,
    },
  })

  const imageUrl = (result.data as { images: { url: string }[] }).images[0]?.url
  if (!imageUrl) throw new Error('Skin generation returned no image')

  return imageUrl
}
