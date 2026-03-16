import { NextResponse } from 'next/server'

import { getOptionalUser } from '@lib/auth/queries'
import { getSkinById } from '@lib/lootbox/queries'

export async function GET(req: Request) {
  try {
    const user = await getOptionalUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const skinId = searchParams.get('skinId')
    if (!skinId) {
      return NextResponse.json({ error: 'Missing skinId' }, { status: 400 })
    }

    const skin = await getSkinById(skinId)
    if (!skin || skin.user_id !== user.id) {
      return NextResponse.json({ error: 'Skin not found' }, { status: 404 })
    }

    return NextResponse.json(skin)
  } catch (error) {
    console.error('[lootbox/status GET]', error)
    return NextResponse.json({ error: 'Failed to get status' }, { status: 500 })
  }
}
