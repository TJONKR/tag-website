import { NextResponse } from 'next/server'

import { getOptionalUser } from '@lib/auth/queries'
import { resetOnboarding } from '@lib/onboarding/mutations'

export async function POST(req: Request) {
  try {
    const user = await getOptionalUser()
    if (!user) {
      return NextResponse.json({ errors: [{ message: 'Unauthorized' }] }, { status: 401 })
    }

    let targetUserId = user.id
    try {
      const body = await req.json()
      if (body?.userId && body.userId !== user.id) {
        if (!user.is_super_admin) {
          return NextResponse.json({ errors: [{ message: 'Forbidden' }] }, { status: 403 })
        }
        targetUserId = body.userId
      }
    } catch {
      // empty body is fine
    }

    await resetOnboarding(targetUserId)
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    return NextResponse.json({ errors: [{ message }] }, { status: 500 })
  }
}
