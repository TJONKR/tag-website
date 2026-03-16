import { NextResponse } from 'next/server'

import { getOptionalUser } from '@lib/auth/queries'
import { onboardingSchema } from '@lib/onboarding/schema'
import { completeOnboarding } from '@lib/onboarding/mutations'

export async function PATCH(req: Request) {
  try {
    const user = await getOptionalUser()

    if (!user) {
      return NextResponse.json({ errors: [{ message: 'Unauthorized' }] }, { status: 401 })
    }

    const body = await req.json()
    const result = onboardingSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ errors: result.error.issues }, { status: 400 })
    }

    await completeOnboarding(user.id, result.data)

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    return NextResponse.json({ errors: [{ message }] }, { status: 500 })
  }
}
