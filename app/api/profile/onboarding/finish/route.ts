import { NextResponse } from 'next/server'

import { getOptionalUser } from '@lib/auth/queries'
import { finishOnboarding } from '@lib/onboarding/mutations'

export async function POST() {
  try {
    const user = await getOptionalUser()
    if (!user) {
      return NextResponse.json({ errors: [{ message: 'Unauthorized' }] }, { status: 401 })
    }

    await finishOnboarding(user.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    return NextResponse.json({ errors: [{ message }] }, { status: 500 })
  }
}
