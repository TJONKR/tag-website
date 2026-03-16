import { NextResponse } from 'next/server'

import { handleGuestWebhook, handleEventWebhook } from '@lib/luma/mutations'

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

    switch (eventType) {
      case 'guest.registered':
      case 'guest.updated': {
        const guest = data.guest
        const lumaEventId = data.event?.api_id
        if (guest?.email && lumaEventId) {
          await handleGuestWebhook(guest, lumaEventId)
        }
        break
      }

      case 'event.created':
      case 'event.updated': {
        const lumaEvent = data.event
        if (lumaEvent?.api_id) {
          await handleEventWebhook(lumaEvent)
        }
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
