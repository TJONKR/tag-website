import { NextResponse } from 'next/server'

import { getOptionalUser } from '@lib/auth/queries'
import { resendApprovalEmail } from '@lib/applications/mutations'

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getOptionalUser()

    if (!user || user.role !== 'operator') {
      return NextResponse.json({ errors: [{ message: 'Unauthorized' }] }, { status: 401 })
    }

    const { id } = await params
    await resendApprovalEmail(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    return NextResponse.json({ errors: [{ message }] }, { status: 500 })
  }
}
