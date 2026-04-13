import { NextResponse } from 'next/server'

import { getOptionalUser } from '@lib/auth/queries'
import { getAiAmClaimsByStatus } from '@lib/membership/queries'

const VALID_STATUSES = ['pending', 'approved', 'rejected', 'revoked'] as const
type ClaimStatus = (typeof VALID_STATUSES)[number]

export async function GET(req: Request) {
  try {
    const user = await getOptionalUser()
    if (!user || !user.is_super_admin) {
      return NextResponse.json(
        { errors: [{ message: 'Forbidden' }] },
        { status: 403 }
      )
    }

    const url = new URL(req.url)
    const statusParam = (url.searchParams.get('status') ?? 'pending') as ClaimStatus

    if (!VALID_STATUSES.includes(statusParam)) {
      return NextResponse.json(
        { errors: [{ message: 'Invalid status filter' }] },
        { status: 400 }
      )
    }

    const claims = await getAiAmClaimsByStatus(statusParam)
    return NextResponse.json(claims)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    return NextResponse.json({ errors: [{ message }] }, { status: 500 })
  }
}
