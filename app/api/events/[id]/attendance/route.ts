import { NextResponse } from 'next/server'

import { getOptionalUser } from '@lib/auth/queries'
import { addAttendance, removeAttendance } from '@lib/events/mutations'
import { getEventAttendees } from '@lib/events/queries'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const attendees = await getEventAttendees(id)
    return NextResponse.json(attendees)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    return NextResponse.json({ errors: [{ message }] }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getOptionalUser()

    if (!user || user.role !== 'operator') {
      return NextResponse.json({ errors: [{ message: 'Unauthorized' }] }, { status: 401 })
    }

    const { id } = await params
    const { userId } = await req.json()

    if (!userId) {
      return NextResponse.json({ errors: [{ message: 'userId is required' }] }, { status: 400 })
    }

    await addAttendance(id, userId)

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    return NextResponse.json({ errors: [{ message }] }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getOptionalUser()

    if (!user || user.role !== 'operator') {
      return NextResponse.json({ errors: [{ message: 'Unauthorized' }] }, { status: 401 })
    }

    const { id } = await params
    const { userId } = await req.json()

    if (!userId) {
      return NextResponse.json({ errors: [{ message: 'userId is required' }] }, { status: 400 })
    }

    await removeAttendance(id, userId)

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    return NextResponse.json({ errors: [{ message }] }, { status: 500 })
  }
}
