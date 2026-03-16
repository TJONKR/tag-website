import { NextResponse } from 'next/server'

import { getOptionalUser } from '@lib/auth/queries'
import { updateMemberRole } from '@lib/people/mutations'
import { updateRoleSchema } from '@lib/people/schema'

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
    const result = updateRoleSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { errors: result.error.issues.map((i) => ({ message: i.message })) },
        { status: 400 }
      )
    }

    await updateMemberRole(id, result.data.role)

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    return NextResponse.json({ errors: [{ message }] }, { status: 500 })
  }
}
