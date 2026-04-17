import { NextResponse } from 'next/server'
import { waitUntil } from '@vercel/functions'

import { getOptionalUser } from '@lib/auth/queries'
import { chooseSkin } from '@lib/lootbox/mutations'
import { runGenerationPipeline } from '@lib/lootbox/pipeline/run'
import { chooseSkinSchema } from '@lib/lootbox/schema'

export const maxDuration = 300

export async function POST(req: Request) {
  try {
    const user = await getOptionalUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = chooseSkinSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { lootboxId, styleId } = parsed.data
    const result = await chooseSkin(user.id, lootboxId, styleId)

    // Keep the serverless function alive until the pipeline finishes
    // (up to maxDuration), without blocking the response the client needs
    // to start polling /api/lootbox/status.
    waitUntil(
      runGenerationPipeline({
        userId: user.id,
        skinId: result.skinId,
        styleId,
        generationType: result.generationType,
      }).catch((err) => {
        console.error('[lootbox/choose] Pipeline error:', err)
      })
    )

    return NextResponse.json({
      skinId: result.skinId,
      rarity: result.rarity,
      generationType: result.generationType,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to choose skin'
    console.error('[lootbox/choose POST]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
