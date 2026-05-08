import { NextResponse } from 'next/server'

import { insertEventHostApplication } from '@lib/event-applications/mutations'
import { eventHostRequestSchema } from '@lib/event-applications/schema'
import {
  checkRateLimit,
  extractIp,
  hashIp,
} from '@lib/event-applications/rate-limit'

const MIN_FILL_MS = 3_000

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const result = eventHostRequestSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { errors: result.error.issues },
        { status: 400 }
      )
    }

    const data = result.data

    // Honeypot — silent 200 drop so bots think they succeeded.
    if (data.website && data.website.length > 0) {
      return NextResponse.json({ success: true })
    }

    // Minimum time-on-page. Scripts tend to post the form the instant the
    // page is rendered; humans take at least a few seconds.
    const elapsed = Date.now() - data.formLoadedAt
    if (!Number.isFinite(elapsed) || elapsed < MIN_FILL_MS) {
      return NextResponse.json(
        {
          errors: [
            { message: 'Please take a moment to review your submission.' },
          ],
        },
        { status: 400 }
      )
    }

    const ip = extractIp(req)
    const ipHash = await hashIp(ip)
    const userAgent = req.headers.get('user-agent')

    const rate = await checkRateLimit(ipHash)
    if (!rate.allowed) {
      return NextResponse.json(
        {
          errors: [
            {
              message:
                rate.reason === 'hourly'
                  ? 'Too many requests. Try again in an hour.'
                  : 'Too many requests today. Try again tomorrow.',
            },
          ],
        },
        { status: 429 }
      )
    }

    await insertEventHostApplication(data, { ipHash, userAgent })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[event-applications:request] Error:', error)
    return NextResponse.json(
      { errors: [{ message: 'Something went wrong. Please try again.' }] },
      { status: 500 }
    )
  }
}
