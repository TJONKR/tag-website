import { NextResponse } from 'next/server'

import { getOptionalUser } from '@lib/auth/queries'
import { reviewApplicationSchema } from '@lib/applications/schema'
import { updateApplicationStatus, acceptApplication } from '@lib/applications/mutations'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getOptionalUser()

    if (!user || user.role !== 'operator') {
      return NextResponse.json({ errors: [{ message: 'Unauthorized' }] }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const result = reviewApplicationSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ errors: result.error.issues }, { status: 400 })
    }

    const { status } = result.data

    if (status === 'accepted') {
      await acceptApplication(id, user.id)
    } else {
      await updateApplicationStatus(id, status, user.id)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    return NextResponse.json({ errors: [{ message }] }, { status: 500 })
  }
}
