import { NextResponse } from 'next/server'

import { getOptionalUser } from '@lib/auth/queries'
import { guidelineSchema } from '@lib/portal/schema'
import { updateGuideline, deleteGuideline } from '@lib/portal/mutations'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getOptionalUser()

    if (!user || user.role !== 'operator') {
      return NextResponse.json({ errors: [{ message: 'Unauthorized' }] }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const result = guidelineSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ errors: result.error.issues }, { status: 400 })
    }

    const item = await updateGuideline(id, result.data)

    return NextResponse.json({ success: true, item })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    console.error('[guidelines] Error:', message)
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

    await deleteGuideline(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    console.error('[guidelines] Error:', message)
    return NextResponse.json({ errors: [{ message }] }, { status: 500 })
  }
}
