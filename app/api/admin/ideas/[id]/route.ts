import { NextResponse } from 'next/server'

import { getOptionalUser } from '@lib/auth/queries'
import { updateIdeaStatusSchema } from '@lib/ideas/schema'
import { updateIdeaStatus } from '@lib/ideas/mutations'

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
    const result = updateIdeaStatusSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ errors: result.error.issues }, { status: 400 })
    }

    await updateIdeaStatus(id, result.data)

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    return NextResponse.json({ errors: [{ message }] }, { status: 500 })
  }
}
