import { NextResponse } from 'next/server'

import { getOptionalUser } from '@lib/auth/queries'
import { getUserSkins } from '@lib/lootbox/queries'

export async function GET() {
  try {
    const user = await getOptionalUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const skins = await getUserSkins(user.id)
    return NextResponse.json(skins)
  } catch (error) {
    console.error('[lootbox/skins GET]', error)
    return NextResponse.json({ error: 'Failed to list skins' }, { status: 500 })
  }
}
