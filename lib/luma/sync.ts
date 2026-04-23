import { createServiceRoleClient } from '@lib/db'

import { getAllEvents, getAllGuests, createEvent as lumaCreateEvent } from './client'
import { getCalendarEventsFromIcs, type IcsEvent } from './ics'
import { scrapePublicEvent } from './scrape'
import type { LumaEventEntry } from './types'

function getCalendarId(): string {
  const id = process.env.LUMA_CALENDAR_ID
  if (!id) throw new Error('Missing LUMA_CALENDAR_ID environment variable')
  return id
}

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

// Strip the "Get up-to-date information at: ..." preamble and "Hosted by..."
// trailer that Luma adds to every ICS DESCRIPTION.
function cleanIcsDescription(raw: string): string {
  return raw
    .replace(/Get up-to-date information at:\s*\S+\s*/i, '')
    .replace(/\n?Address:[\s\S]*?(?=Hosted by|$)/i, '')
    .replace(/\n?Hosted by[\s\S]*$/i, '')
    .trim()
}

export async function syncEventsFromLuma(triggeredBy: string) {
  const supabase = createServiceRoleClient()
  let eventsSynced = 0
  let externalSynced = 0
  const errors: string[] = []

  try {
    // 1. Primary source: events managed by the TAG calendar (via API).
    const apiEvents = await getAllEvents()
    const apiEventIds = new Set(apiEvents.map((e) => e.event.api_id))

    for (const entry of apiEvents) {
      const { event } = entry
      const { error } = await supabase.from('events').upsert(
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
          is_externally_managed: false,
          external_host: null,
        },
        { onConflict: 'luma_event_id' }
      )

      if (error) {
        errors.push(`Event ${event.api_id}: ${error.message}`)
      } else {
        eventsSynced++
      }
    }

    // 2. Fill the gap: events that appear on the calendar but are owned by
    // another calendar (co-hosted / pinned). Luma's API hides these — the
    // public ICS feed is the only machine-readable source.
    let icsEvents: IcsEvent[] = []
    try {
      icsEvents = await getCalendarEventsFromIcs(getCalendarId())
    } catch (err) {
      errors.push(
        `ICS fetch failed: ${err instanceof Error ? err.message : 'unknown'}`
      )
    }

    const externalOnly = icsEvents.filter((e) => !apiEventIds.has(e.uid))

    for (const ics of externalOnly) {
      const scraped = ics.slug ? await scrapePublicEvent(ics.slug).catch(() => null) : null

      const description =
        scraped?.description?.trim() ||
        cleanIcsDescription(ics.description) ||
        ''

      const hostName =
        scraped?.hosts.length ? scraped.hosts.join(', ') : ics.organizer ?? null

      const { error } = await supabase.from('events').upsert(
        {
          luma_event_id: ics.uid,
          title: ics.summary,
          description,
          date_iso: deriveDateIso(ics.startAt),
          location: ics.location,
          luma_url: ics.publicUrl,
          start_at: ics.startAt,
          end_at: ics.endAt,
          cover_url: scraped?.coverUrl ?? null,
          type: 'Event',
          is_externally_managed: true,
          external_host: hostName,
        },
        { onConflict: 'luma_event_id' }
      )

      if (error) {
        errors.push(`External event ${ics.uid}: ${error.message}`)
      } else {
        externalSynced++
      }
    }

    await supabase.from('luma_sync_log').insert({
      sync_type: 'events',
      status: errors.length > 0 ? 'partial' : 'success',
      events_synced: eventsSynced + externalSynced,
      details: {
        total: apiEvents.length + externalOnly.length,
        owned: eventsSynced,
        external: externalSynced,
        errors,
      },
      triggered_by: triggeredBy,
    })

    return {
      eventsSynced: eventsSynced + externalSynced,
      total: apiEvents.length + externalOnly.length,
      external: externalSynced,
      errors,
    }
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

    const emailToUserId = new Map<string, string>()
    let page = 1
    const perPage = 1000

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
