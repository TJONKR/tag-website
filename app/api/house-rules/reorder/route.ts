import { NextResponse } from 'next/server'

import { getOptionalUser } from '@lib/auth/queries'
import { reorderHouseRules } from '@lib/portal/mutations'

export async function PUT(req: Request) {
  try {
    const user = await getOptionalUser()

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ errors: [{ message: 'Unauthorized' }] }, { status: 401 })
    }

    const { ids } = (await req.json()) as { ids: string[] }

    if (!Array.isArray(ids)) {
      return NextResponse.json({ errors: [{ message: 'ids must be an array' }] }, { status: 400 })
    }

    await reorderHouseRules(ids)

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    console.error('[house-rules reorder] Error:', message)
    return NextResponse.json({ errors: [{ message }] }, { status: 500 })
  }
}
