import { NextResponse } from 'next/server'

import { getOptionalUser } from '@lib/auth/queries'
import { syncEventsFromLuma, syncGuestsForEvent } from '@lib/luma/sync'
import { createServiceRoleClient } from '@lib/db'

export async function POST(req: Request) {
  try {
    const user = await getOptionalUser()

    if (!user || user.role !== 'operator') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type } = await req.json()

    if (type === 'events' || type === 'all') {
      const result = await syncEventsFromLuma(user.id)

      if (type === 'all') {
        // After syncing events, sync guests for all Luma-linked events
        const supabase = createServiceRoleClient()
        const { data: lumaEvents } = await supabase
          .from('events')
          .select('id, luma_event_id')
          .not('luma_event_id', 'is', null)

        let totalGuests = 0
        for (const event of lumaEvents ?? []) {
          const guestResult = await syncGuestsForEvent(event.id, event.luma_event_id!)
          totalGuests += guestResult.guestsSynced
        }

        return NextResponse.json({
          eventsSynced: result.eventsSynced,
          guestsSynced: totalGuests,
        })
      }

      return NextResponse.json({ eventsSynced: result.eventsSynced })
    }

    if (type === 'guests') {
      const supabase = createServiceRoleClient()
      const { data: lumaEvents } = await supabase
        .from('events')
        .select('id, luma_event_id')
        .not('luma_event_id', 'is', null)

      let totalGuests = 0
      for (const event of lumaEvents ?? []) {
        const guestResult = await syncGuestsForEvent(event.id, event.luma_event_id!)
        totalGuests += guestResult.guestsSynced
      }

      return NextResponse.json({ guestsSynced: totalGuests })
    }

    return NextResponse.json({ error: 'Invalid sync type' }, { status: 400 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Sync failed'
    console.error('[luma/sync POST] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
