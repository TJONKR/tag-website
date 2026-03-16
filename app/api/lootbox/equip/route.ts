import { NextResponse } from 'next/server'

import { getOptionalUser } from '@lib/auth/queries'
import { equipSkin } from '@lib/lootbox/mutations'

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

    await equipSkin(user.id, skinId)
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to equip skin'
    console.error('[lootbox/equip POST]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
