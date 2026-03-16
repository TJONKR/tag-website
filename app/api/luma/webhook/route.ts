import { NextResponse } from 'next/server'

import { createServiceRoleClient } from '@lib/db'

export async function POST(req: Request) {
  try {
    // Verify webhook token from query param
    const url = new URL(req.url)
    const token = url.searchParams.get('token')
    const secret = process.env.LUMA_WEBHOOK_SECRET

    if (!secret || token !== secret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await req.json()
    const eventType = payload?.type as string | undefined
    const data = payload?.data

    if (!eventType || !data) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const supabase = createServiceRoleClient()

    switch (eventType) {
      case 'guest.registered':
      case 'guest.updated': {
        const guest = data.guest
        const lumaEventId = data.event?.api_id
        if (!guest?.email || !lumaEventId) break

        // Find the TAG event
        const { data: tagEvent } = await supabase
          .from('events')
          .select('id')
          .eq('luma_event_id', lumaEventId)
          .single()

        if (!tagEvent) break

        // Search all users for matching email
        let userId: string | null = null
        let page = 1
        const perPage = 1000

        while (!userId) {
          const { data: pageData, error } = await supabase.auth.admin.listUsers({
            page,
            perPage,
          })
          if (error || pageData.users.length === 0) break

          const match = pageData.users.find(
            (u) => u.email?.toLowerCase() === guest.email.toLowerCase()
          )
          if (match) {
            userId = match.id
            break
          }
          if (pageData.users.length < perPage) break
          page++
        }

        if (!userId) break

        const checkedInAt = guest.event_tickets?.[0]?.checked_in_at ?? null

        await supabase.from('event_attendance').upsert(
          {
            event_id: tagEvent.id,
            user_id: userId,
            checked_in_at: checkedInAt,
            luma_guest_id: guest.api_id,
            luma_approval_status: guest.approval_status,
            registered_at: guest.created_at,
            source: 'luma',
          },
          { onConflict: 'event_id,user_id' }
        )
        break
      }

      case 'event.created':
      case 'event.updated': {
        const lumaEvent = data.event
        if (!lumaEvent?.api_id) break

        const geo = lumaEvent.geo_address_json
        const location =
          geo?.description ?? geo?.full_address ?? (geo?.city ? `${geo.city}, ${geo.country}` : '')

        await supabase
          .from('events')
          .upsert(
            {
              luma_event_id: lumaEvent.api_id,
              title: lumaEvent.name,
              description: lumaEvent.description ?? '',
              date_iso: lumaEvent.start_at?.slice(0, 10),
              location,
              luma_url: lumaEvent.url,
              start_at: lumaEvent.start_at,
              end_at: lumaEvent.end_at,
              cover_url: lumaEvent.cover_url,
              type: 'Event',
            },
            { onConflict: 'luma_event_id' }
          )
        break
      }

      default:
        // Unknown event type — acknowledge but don't process
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[luma/webhook POST] Error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
