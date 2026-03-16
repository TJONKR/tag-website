import { NextResponse } from 'next/server'

import { getOptionalUser } from '@lib/auth/queries'
import { retrySkinGeneration } from '@lib/lootbox/mutations'
import { runGenerationPipeline } from '@lib/lootbox/pipeline/run'

export async function POST(req: Request) {
  try {
    const user = await getOptionalUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { skinId } = await req.json()
    if (!skinId) {
      return NextResponse.json({ error: 'Missing skinId' }, { status: 400 })
    }

    const result = await retrySkinGeneration(user.id, skinId)

    // Fire-and-forget generation pipeline
    runGenerationPipeline({
      userId: user.id,
      skinId: result.skinId,
      styleId: result.styleId,
      generationType: result.generationType,
    }).catch((err) => {
      console.error('[lootbox/retry] Pipeline error:', err)
    })

    return NextResponse.json({ skinId: result.skinId })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to retry generation'
    console.error('[lootbox/retry POST]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
