import { NextRequest, NextResponse } from 'next/server'

import { fal, FAL_MODELS } from '@lib/fal/client'
import { generateVideoSchema } from '@lib/fal/schema'
import type { GenerateVideoOutput } from '@lib/fal/types'

export const maxDuration = 300

export async function POST(request: NextRequest) {
  const body = await request.json()
  const parsed = generateVideoSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  const result = await fal.subscribe(FAL_MODELS.video.veo31, {
    input: parsed.data,
  })

  const data = result.data as GenerateVideoOutput

  return NextResponse.json({
    video: data.video,
  })
}
