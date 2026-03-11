import { NextResponse } from 'next/server'

import { getUser } from '@lib/auth/queries'
import { getSubscription } from '@lib/membership/queries'
import { createBillingPortalSession } from '@lib/membership/mutations'

export async function POST() {
  try {
    const user = await getUser()

    const subscription = await getSubscription(user.id)
    if (!subscription) {
      return NextResponse.json(
        { errors: [{ message: 'No active subscription found' }] },
        { status: 400 }
      )
    }

    const url = await createBillingPortalSession(
      subscription.stripe_customer_id
    )

    return NextResponse.json({ url })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Something went wrong'
    console.error('[stripe/portal POST] Error:', message)
    return NextResponse.json(
      { errors: [{ message }] },
      { status: 500 }
    )
  }
}
