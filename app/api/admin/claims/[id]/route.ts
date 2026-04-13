import { NextResponse } from 'next/server'

import { getOptionalUser } from '@lib/auth/queries'
import { reviewAiAmClaim } from '@lib/membership/mutations'
import { reviewClaimSchema } from '@lib/membership/schema'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getOptionalUser()
    if (!user || !user.is_super_admin) {
      return NextResponse.json(
        { errors: [{ message: 'Forbidden' }] },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await req.json()
    const parsed = reviewClaimSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.issues },
        { status: 400 }
      )
    }

    await reviewAiAmClaim(id, user.id, parsed.data.status, parsed.data.notes)

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    return NextResponse.json({ errors: [{ message }] }, { status: 500 })
  }
}
