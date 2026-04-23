import { NextResponse } from 'next/server'

import { getOptionalUser } from '@lib/auth/queries'
import { tagUserInPhoto, untagUserFromPhoto } from '@lib/space-photos/mutations'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function POST(req: Request, { params }: RouteContext) {
  try {
    const user = await getOptionalUser()
    if (!user) {
      return NextResponse.json({ errors: [{ message: 'Unauthorized' }] }, { status: 401 })
    }
    const { id: photoId } = await params
    const body = (await req.json()) as { userId?: string }
    if (!body.userId) {
      return NextResponse.json(
        { errors: [{ message: 'userId is required' }] },
        { status: 400 }
      )
    }
    await tagUserInPhoto(photoId, body.userId, user.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    return NextResponse.json({ errors: [{ message }] }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: RouteContext) {
  try {
    const user = await getOptionalUser()
    if (!user) {
      return NextResponse.json({ errors: [{ message: 'Unauthorized' }] }, { status: 401 })
    }
    const { id: photoId } = await params
    const body = (await req.json()) as { userId?: string }
    if (!body.userId) {
      return NextResponse.json(
        { errors: [{ message: 'userId is required' }] },
        { status: 400 }
      )
    }
    await untagUserFromPhoto(photoId, body.userId)
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    return NextResponse.json({ errors: [{ message }] }, { status: 500 })
  }
}
