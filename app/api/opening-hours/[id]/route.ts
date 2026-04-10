import { NextResponse } from 'next/server'

import { getOptionalUser } from '@lib/auth/queries'
import { openingHoursSchema } from '@lib/portal/schema'
import { updateOpeningHours, deleteOpeningHours } from '@lib/portal/mutations'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getOptionalUser()

    if (!user || user.role !== 'operator') {
      return NextResponse.json({ errors: [{ message: 'Unauthorized' }] }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const result = openingHoursSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ errors: result.error.issues }, { status: 400 })
    }

    const item = await updateOpeningHours(id, result.data)

    return NextResponse.json({ success: true, item })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    console.error('[opening-hours] Error:', message)
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

    await deleteOpeningHours(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    console.error('[opening-hours] Error:', message)
    return NextResponse.json({ errors: [{ message }] }, { status: 500 })
  }
}
