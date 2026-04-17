import { NextResponse } from 'next/server'
import { waitUntil } from '@vercel/functions'

import { getOptionalUser } from '@lib/auth/queries'
import { retrySkinGeneration } from '@lib/lootbox/mutations'
import { runGenerationPipeline } from '@lib/lootbox/pipeline/run'
import { retrySkinSchema } from '@lib/lootbox/schema'

export const maxDuration = 300

export async function POST(req: Request) {
  try {
    const user = await getOptionalUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = retrySkinSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const result = await retrySkinGeneration(user.id, parsed.data.skinId)

    // Keep the serverless function alive until the pipeline finishes
    // (up to maxDuration), without blocking the response.
    waitUntil(
      runGenerationPipeline({
        userId: user.id,
        skinId: result.skinId,
        styleId: result.styleId,
        generationType: result.generationType,
      }).catch((err) => {
        console.error('[lootbox/retry] Pipeline error:', err)
      })
    )

    return NextResponse.json({ skinId: result.skinId })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to retry generation'
    console.error('[lootbox/retry POST]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
