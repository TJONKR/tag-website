import { NextResponse } from 'next/server'

import { getOptionalUser } from '@lib/auth/queries'
import { houseRuleSchema } from '@lib/portal/schema'
import { updateHouseRule, deleteHouseRule } from '@lib/portal/mutations'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getOptionalUser()

    if (!user || user.role !== 'operator') {
      return NextResponse.json({ errors: [{ message: 'Unauthorized' }] }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const result = houseRuleSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ errors: result.error.issues }, { status: 400 })
    }

    await updateHouseRule(id, result.data)

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    console.error('[house-rules] Error:', message)
    return NextResponse.json({ errors: [{ message }] }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getOptionalUser()

    if (!user || user.role !== 'operator') {
      return NextResponse.json({ errors: [{ message: 'Unauthorized' }] }, { status: 401 })
    }

    const { id } = await params

    await deleteHouseRule(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    console.error('[house-rules] Error:', message)
    return NextResponse.json({ errors: [{ message }] }, { status: 500 })
  }
}
