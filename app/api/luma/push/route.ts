import { NextResponse } from 'next/server'

import { getOptionalUser } from '@lib/auth/queries'
import { pushEventToLuma } from '@lib/luma/sync'

export async function POST(req: Request) {
  try {
    const user = await getOptionalUser()

    if (!user || user.role !== 'operator') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { eventId } = await req.json()

    if (!eventId || typeof eventId !== 'string') {
      return NextResponse.json({ error: 'eventId is required' }, { status: 400 })
    }

    const result = await pushEventToLuma(eventId)

    return NextResponse.json({ lumaUrl: result.lumaUrl })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Push failed'
    console.error('[luma/push POST] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
