import { createServiceRoleClient } from '@lib/db'

/**
 * Find a Supabase user by email, searching through paginated auth users.
 * Returns userId or null if not found.
 */
export async function findUserByEmail(email: string): Promise<string | null> {
  const supabase = createServiceRoleClient()
  let page = 1
  const perPage = 1000

  while (true) {
    const { data: pageData, error } = await supabase.auth.admin.listUsers({
      page,
      perPage,
    })
    if (error || pageData.users.length === 0) return null

    const match = pageData.users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    )
    if (match) return match.id
    if (pageData.users.length < perPage) return null
    page++
  }
}

/**
 * Handle a Luma guest webhook event (guest.registered / guest.updated).
 * Matches guest email to a TAG user and upserts attendance.
 */
export async function handleGuestWebhook(guest: {
  email: string
  api_id: string
  approval_status: string
  created_at: string
  event_tickets?: { checked_in_at: string | null }[]
}, lumaEventId: string) {
  const supabase = createServiceRoleClient()

  // Find the TAG event
  const { data: tagEvent } = await supabase
    .from('events')
    .select('id')
    .eq('luma_event_id', lumaEventId)
    .single()

  if (!tagEvent) return

  // Match guest email to a TAG user
  const userId = await findUserByEmail(guest.email)
  if (!userId) return

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
}

/**
 * Handle a Luma event webhook (event.created / event.updated).
 * Upserts the event in our events table.
 */
export async function handleEventWebhook(lumaEvent: {
  api_id: string
  name: string
  description?: string | null
  start_at?: string | null
  end_at?: string | null
  url?: string | null
  cover_url?: string | null
  geo_address_json?: {
    description?: string
    full_address?: string
    city?: string
    country?: string
  } | null
}) {
  const supabase = createServiceRoleClient()

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
}
