import { NextResponse } from 'next/server'

import { getOptionalUser } from '@lib/auth/queries'
import { directInviteSchema } from '@lib/applications/schema'
import { inviteUserByEmail } from '@lib/applications/mutations'

export async function POST(req: Request) {
  try {
    const user = await getOptionalUser()

    if (!user || user.role !== 'operator') {
      return NextResponse.json({ errors: [{ message: 'Unauthorized' }] }, { status: 401 })
    }

    const body = await req.json()
    const result = directInviteSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ errors: result.error.issues }, { status: 400 })
    }

    await inviteUserByEmail(result.data.email, result.data.name)

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    return NextResponse.json({ errors: [{ message }] }, { status: 500 })
  }
}
