import { NextResponse } from 'next/server'

import { joinSchema } from '@lib/join/schema'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const result = joinSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { errors: result.error.issues },
        { status: 400 }
      )
    }

    // TODO: persist to database
    console.log('[join] New application:', result.data)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { errors: [{ message: 'Invalid request body' }] },
      { status: 400 }
    )
  }
}
