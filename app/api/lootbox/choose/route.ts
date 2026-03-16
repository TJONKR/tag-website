import { NextResponse } from 'next/server'

import { getOptionalUser } from '@lib/auth/queries'
import { chooseSkin } from '@lib/lootbox/mutations'
import { runGenerationPipeline } from '@lib/lootbox/pipeline/run'

export async function POST(req: Request) {
  try {
    const user = await getOptionalUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { lootboxId, styleId } = await req.json()
    if (!lootboxId || !styleId) {
      return NextResponse.json({ error: 'Missing lootboxId or styleId' }, { status: 400 })
    }

    const result = await chooseSkin(user.id, lootboxId, styleId)

    // Fire-and-forget generation pipeline
    runGenerationPipeline({
      userId: user.id,
      skinId: result.skinId,
      styleId,
      generationType: result.generationType,
    }).catch((err) => {
      console.error('[lootbox/choose] Pipeline error:', err)
    })

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
