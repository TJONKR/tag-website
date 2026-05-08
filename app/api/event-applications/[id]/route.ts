import { NextResponse } from 'next/server'

import { getOptionalUser } from '@lib/auth/queries'
import { updateEventApplicationStatus } from '@lib/event-applications/mutations'
import { reviewEventApplicationSchema } from '@lib/event-applications/schema'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getOptionalUser()

    if (!user || user.role !== 'operator') {
      return NextResponse.json(
        { errors: [{ message: 'Unauthorized' }] },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await req.json()
    const result = reviewEventApplicationSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ errors: result.error.issues }, { status: 400 })
    }

    const { status } = result.data

    await updateEventApplicationStatus(id, status, user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    return NextResponse.json({ errors: [{ message }] }, { status: 500 })
  }
}
