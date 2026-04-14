import { NextResponse } from 'next/server'

import { getOptionalUser } from '@lib/auth/queries'
import { rollLootboxCards } from '@lib/lootbox/mutations'
import { getNextAvailableLootbox } from '@lib/lootbox/queries'
import { rollLootboxSchema } from '@lib/lootbox/schema'

/**
 * Roll cards for an available lootbox.
 * If no lootboxId is provided, picks the user's oldest available lootbox.
 * Idempotent: returns existing cards if already rolled.
 */
export async function POST(req: Request) {
  try {
    const user = await getOptionalUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const parsed = rollLootboxSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    let lootboxId = parsed.data.lootboxId
    if (!lootboxId) {
      const next = await getNextAvailableLootbox(user.id)
      if (!next) {
        return NextResponse.json({ error: 'No lootboxes available' }, { status: 404 })
      }
      lootboxId = next.id
    }

    const result = await rollLootboxCards(user.id, lootboxId)
    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to roll lootbox'
    console.error('[lootbox/roll POST]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
