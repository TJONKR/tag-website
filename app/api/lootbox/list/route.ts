import { NextResponse } from 'next/server'

import { getOptionalUser } from '@lib/auth/queries'
import { getUserLootboxes } from '@lib/lootbox/queries'

export async function GET() {
  try {
    const user = await getOptionalUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const lootboxes = await getUserLootboxes(user.id)
    return NextResponse.json(lootboxes)
  } catch (error) {
    console.error('[lootbox/list GET]', error)
    return NextResponse.json({ error: 'Failed to list lootboxes' }, { status: 500 })
  }
}
