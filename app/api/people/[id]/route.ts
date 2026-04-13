import { NextResponse } from 'next/server'

import { getOptionalUser } from '@lib/auth/queries'
import { deleteMember } from '@lib/people/mutations'

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getOptionalUser()

    if (!user || user.role !== 'operator') {
      return NextResponse.json({ errors: [{ message: 'Unauthorized' }] }, { status: 401 })
    }

    const { id } = await params

    if (id === user.id) {
      return NextResponse.json(
        { errors: [{ message: 'You cannot delete yourself' }] },
        { status: 400 }
      )
    }

    await deleteMember(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    return NextResponse.json({ errors: [{ message }] }, { status: 500 })
  }
}
