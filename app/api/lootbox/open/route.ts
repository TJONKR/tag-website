import { NextResponse } from 'next/server'

import { getOptionalUser } from '@lib/auth/queries'
import { openLootbox } from '@lib/lootbox/mutations'
import { getLootboxEvent } from '@lib/lootbox/queries'
import { openLootboxSchema } from '@lib/lootbox/schema'

export async function POST(req: Request) {
  try {
    const user = await getOptionalUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = openLootboxSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { eventSlug } = parsed.data

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
