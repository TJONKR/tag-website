import { NextResponse } from 'next/server'

import { getOptionalUser } from '@lib/auth/queries'
import { equipSkin } from '@lib/lootbox/mutations'
import { equipSkinSchema } from '@lib/lootbox/schema'

export async function POST(req: Request) {
  try {
    const user = await getOptionalUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = equipSkinSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    await equipSkin(user.id, parsed.data.skinId)
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to equip skin'
    console.error('[lootbox/equip POST]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
