import { NextResponse } from 'next/server'

import { getOptionalUser } from '@lib/auth/queries'
import { reorderSpacePhotosSchema } from '@lib/space-photos/schema'
import { reorderSpacePhotos } from '@lib/space-photos/mutations'

export async function PUT(req: Request) {
  try {
    const user = await getOptionalUser()

    if (!user || user.role !== 'operator') {
      return NextResponse.json(
        { errors: [{ message: 'Unauthorized' }] },
        { status: 401 }
      )
    }

    const body = await req.json()
    const result = reorderSpacePhotosSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ errors: result.error.issues }, { status: 400 })
    }

    await reorderSpacePhotos(result.data.ids)
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    return NextResponse.json({ errors: [{ message }] }, { status: 500 })
  }
}
