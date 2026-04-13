import { NextResponse } from 'next/server'

import { getOptionalUser } from '@lib/auth/queries'
import { submitAiAmClaim } from '@lib/membership/actions'

export async function POST() {
  try {
    const user = await getOptionalUser()
    if (!user) {
      return NextResponse.json(
        { errors: [{ message: 'Unauthorized' }] },
        { status: 401 }
      )
    }

    const result = await submitAiAmClaim()

    if (result.status === 'failed') {
      return NextResponse.json(
        { errors: [{ message: result.error }] },
        { status: 409 }
      )
    }

    return NextResponse.json({ success: true, data: result.data })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    return NextResponse.json({ errors: [{ message }] }, { status: 500 })
  }
}
