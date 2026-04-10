import { NextResponse } from 'next/server'

import { getOptionalUser } from '@lib/auth/queries'
import { getMembers, getMemberCounts } from '@lib/people/queries'

export async function GET(req: Request) {
  try {
    const user = await getOptionalUser()

    if (!user) {
      return NextResponse.json({ errors: [{ message: 'Unauthorized' }] }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const countsOnly = searchParams.get('counts') === 'true'

    if (countsOnly) {
      const counts = await getMemberCounts()
      return NextResponse.json(counts)
    }

    const members = await getMembers()
    return NextResponse.json(members)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    return NextResponse.json({ errors: [{ message }] }, { status: 500 })
  }
}
