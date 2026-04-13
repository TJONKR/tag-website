import { createServiceRoleClient } from '@lib/db'

import { getAllEvents, getAllGuests, createEvent as lumaCreateEvent } from './client'
import type { LumaEventEntry } from './types'

function extractLocation(entry: LumaEventEntry): string {
  const geo = entry.event.geo_address_json
  if (geo?.description) return geo.description
  if (geo?.full_address) return geo.full_address
  if (geo?.city && geo?.country) return `${geo.city}, ${geo.country}`
  return ''
}

function deriveDateIso(startAt: string): string {
  // Extract YYYY-MM-DD from ISO timestamp
  return startAt.slice(0, 10)
}

export async function syncEventsFromLuma(triggeredBy: string) {
  const supabase = createServiceRoleClient()
  let eventsSynced = 0
  const errors: string[] = []

  try {
    const lumaEvents = await getAllEvents()

    for (const entry of lumaEvents) {
      const { event } = entry

      const { error } = await supabase
        .from('events')
        .upsert(
          {
            luma_event_id: event.api_id,
            title: event.name,
            description: event.description ?? '',
            date_iso: deriveDateIso(event.start_at),
            location: extractLocation(entry),
            luma_url: event.url,
            start_at: event.start_at,
            end_at: event.end_at,
            cover_url: event.cover_url,
            type: 'Event',
          },
          { onConflict: 'luma_event_id' }
        )

      if (error) {
        errors.push(`Event ${event.api_id}: ${error.message}`)
      } else {
        eventsSynced++
      }
    }

    await supabase.from('luma_sync_log').insert({
      sync_type: 'events',
      status: errors.length > 0 ? 'partial' : 'success',
      events_synced: eventsSynced,
      details: { total: lumaEvents.length, errors },
      triggered_by: triggeredBy,
    })

    return { eventsSynced, total: lumaEvents.length, errors }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'

    await supabase.from('luma_sync_log').insert({
      sync_type: 'events',
      status: 'error',
      error: message,
      triggered_by: triggeredBy,
    })

    throw err
  }
}

export async function pushEventToLuma(eventId: string) {
  const supabase = createServiceRoleClient()

  const { data: event, error } = await supabase
    .from('events')
    .select('id, title, description, date_iso, start_at, end_at')
    .eq('id', eventId)
    .single()

  if (error || !event) throw new Error('Event not found')

  // Use existing start/end or default to date_iso noon-to-evening
  const startAt = event.start_at ?? `${event.date_iso}T18:00:00+02:00`
  const endAt = event.end_at ?? `${event.date_iso}T21:00:00+02:00`

  const lumaEvent = await lumaCreateEvent({
    name: event.title,
    description: event.description || undefined,
    start_at: startAt,
    end_at: endAt,
  })

  await supabase
    .from('events')
    .update({
      luma_event_id: lumaEvent.api_id,
      luma_url: lumaEvent.url,
      start_at: lumaEvent.start_at,
      end_at: lumaEvent.end_at,
    })
    .eq('id', eventId)

  await supabase.from('luma_sync_log').insert({
    sync_type: 'push',
    status: 'success',
    events_synced: 1,
    details: { eventId, lumaEventId: lumaEvent.api_id },
    triggered_by: 'operator',
  })

  return { lumaUrl: lumaEvent.url, lumaEventId: lumaEvent.api_id }
}

export async function syncGuestsForEvent(
  eventId: string,
  lumaEventId: string,
  triggeredBy: string = 'operator'
) {
  const supabase = createServiceRoleClient()
  let guestsSynced = 0
  const unmatched: string[] = []

  try {
    const lumaGuests = await getAllGuests(lumaEventId)

    // Build email → userId map from all auth users
    const emailToUserId = new Map<string, string>()
    let page = 1
    const perPage = 1000

    // Paginate through auth users
    while (true) {
      const { data, error } = await supabase.auth.admin.listUsers({
        page,
        perPage,
      })
      if (error) throw error
      for (const u of data.users) {
        if (u.email) emailToUserId.set(u.email.toLowerCase(), u.id)
      }
      if (data.users.length < perPage) break
      page++
    }

    for (const entry of lumaGuests) {
      const { guest } = entry
      if (!guest.email) {
        unmatched.push(`No email: ${guest.name ?? guest.api_id}`)
        continue
      }

      const userId = emailToUserId.get(guest.email.toLowerCase())
      if (!userId) {
        unmatched.push(guest.email)
        continue
      }

      const checkedInAt = guest.event_tickets?.[0]?.checked_in_at ?? null

      const { error } = await supabase
        .from('event_attendance')
        .upsert(
          {
            event_id: eventId,
            user_id: userId,
            checked_in_at: checkedInAt,
            luma_guest_id: guest.api_id,
            luma_approval_status: guest.approval_status,
            registered_at: guest.created_at,
            source: 'luma',
          },
          { onConflict: 'event_id,user_id' }
        )

      if (error) {
        unmatched.push(`DB error for ${guest.email}: ${error.message}`)
      } else {
        guestsSynced++
      }
    }

    await supabase.from('luma_sync_log').insert({
      sync_type: 'guests',
      status: 'success',
      guests_synced: guestsSynced,
      details: { eventId, total: lumaGuests.length, unmatched },
      triggered_by: triggeredBy,
    })

    return { guestsSynced, total: lumaGuests.length, unmatched }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'

    await supabase.from('luma_sync_log').insert({
      sync_type: 'guests',
      status: 'error',
      error: message,
      details: { eventId },
      triggered_by: triggeredBy,
    })

    throw err
  }
}
