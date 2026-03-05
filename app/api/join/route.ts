import { NextResponse } from 'next/server'

import { joinSchema } from '@lib/join/schema'
import { insertApplication } from '@lib/join/mutations'

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

    await insertApplication(result.data)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[join] Error:', error)
    return NextResponse.json(
      { errors: [{ message: 'Something went wrong. Please try again.' }] },
      { status: 500 }
    )
  }
}
