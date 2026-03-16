import { NextRequest, NextResponse } from 'next/server'

import { getOptionalUser } from '@lib/auth/queries'
import { fal, FAL_MODELS } from '@lib/fal/client'
import { generateVideoSchema } from '@lib/fal/schema'
import type { GenerateVideoOutput } from '@lib/fal/types'

export const maxDuration = 300

export async function POST(request: NextRequest) {
  const user = await getOptionalUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

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
