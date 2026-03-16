import { NextResponse } from 'next/server'

import { getOptionalUser } from '@lib/auth/queries'
import { openLootbox } from '@lib/lootbox/mutations'
import { getLootboxEvent } from '@lib/lootbox/queries'

export async function POST(req: Request) {
  try {
    const user = await getOptionalUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { lootboxId, eventSlug } = await req.json()

    // Get the event
    const slug = eventSlug || 'og-day-one'
    const event = await getLootboxEvent(slug)
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    const result = await openLootbox(user.id, event.id)
    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to open lootbox'
    console.error('[lootbox/open POST]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
