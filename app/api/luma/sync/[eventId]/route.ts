import { NextResponse } from 'next/server'

import { getOptionalUser } from '@lib/auth/queries'
import { syncGuestsForEvent } from '@lib/luma/sync'
import { createServiceRoleClient } from '@lib/db'

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const user = await getOptionalUser()

    if (!user || user.role !== 'operator') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { eventId } = await params

    // Look up the Luma event ID for this TAG event
    const supabase = createServiceRoleClient()
    const { data: event, error } = await supabase
      .from('events')
      .select('luma_event_id')
      .eq('id', eventId)
      .single()

    if (error || !event?.luma_event_id) {
      return NextResponse.json(
        { error: 'Event not found or not linked to Luma' },
        { status: 404 }
      )
    }

    const result = await syncGuestsForEvent(eventId, event.luma_event_id, user.id)

    return NextResponse.json({
      guestsSynced: result.guestsSynced,
      total: result.total,
      unmatched: result.unmatched.length,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Sync failed'
    console.error('[luma/sync/eventId POST] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
