import { NextRequest, NextResponse } from 'next/server'

import { getOptionalUser } from '@lib/auth/queries'
import { fal, FAL_MODELS } from '@lib/fal/client'
import { generateImagesSchema } from '@lib/fal/schema'
import type { GenerateImagesOutput } from '@lib/fal/types'

export const maxDuration = 60

export async function POST(request: NextRequest) {
  const user = await getOptionalUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const parsed = generateImagesSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  const result = await fal.subscribe(FAL_MODELS.image.flux, {
    input: parsed.data,
  })

  const data = result.data as GenerateImagesOutput

  return NextResponse.json({
    images: data.images,
    seed: data.seed,
    prompt: data.prompt,
  })
}
