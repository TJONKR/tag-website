import { NextResponse } from 'next/server'

import { getUser } from '@lib/auth/queries'
import { getLatestContract } from '@lib/membership/queries'
import {
  createOrGetStripeCustomer,
  createCheckoutSession,
} from '@lib/membership/mutations'
import { CONTRACT_VERSION } from '@lib/membership/contract-template'

export async function POST() {
  try {
    const user = await getUser()

    const contract = await getLatestContract(user.id)
    if (!contract || contract.version !== CONTRACT_VERSION) {
      return NextResponse.json(
        { errors: [{ message: 'Contract must be signed before checkout' }] },
        { status: 400 }
      )
    }

    const customerId = await createOrGetStripeCustomer(user.id, user.email)
    const url = await createCheckoutSession(customerId, user.id)

    return NextResponse.json({ url })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Something went wrong'
    console.error('[stripe/checkout POST] Error:', message)
    return NextResponse.json(
      { errors: [{ message }] },
      { status: 500 }
    )
  }
}
