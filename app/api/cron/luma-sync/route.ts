import { NextResponse } from 'next/server'

import { createServiceRoleClient } from '@lib/db'
import { syncEventsFromLuma, syncGuestsForEvent } from '@lib/luma/sync'

export const maxDuration = 300

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization')

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const eventResult = await syncEventsFromLuma('cron')

    // Sync guests for all Luma-linked events
    const supabase = createServiceRoleClient()
    const { data: lumaEvents } = await supabase
      .from('events')
      .select('id, luma_event_id')
      .not('luma_event_id', 'is', null)

    let totalGuests = 0
    const guestErrors: string[] = []

    for (const event of lumaEvents ?? []) {
      try {
        const guestResult = await syncGuestsForEvent(
          event.id,
          event.luma_event_id!,
          'cron'
        )
        totalGuests += guestResult.guestsSynced
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        guestErrors.push(`Event ${event.id}: ${message}`)
      }
    }

    // Log overall cron summary
    await supabase.from('luma_sync_log').insert({
      sync_type: 'all',
      status: guestErrors.length > 0 ? 'partial' : 'success',
      events_synced: eventResult.eventsSynced,
      guests_synced: totalGuests,
      details: {
        totalEvents: eventResult.total,
        eventErrors: eventResult.errors,
        guestErrors,
      },
      triggered_by: 'cron',
    })

    return NextResponse.json({
      eventsSynced: eventResult.eventsSynced,
      guestsSynced: totalGuests,
      guestErrors: guestErrors.length,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Cron sync failed'
    console.error('[cron/luma-sync] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
