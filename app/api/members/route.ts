import { NextResponse } from 'next/server'

import { getOptionalUser } from '@lib/auth/queries'
import { getMembersList } from '@lib/people/queries'

export async function GET() {
  try {
    const user = await getOptionalUser()

    if (!user || user.role !== 'operator') {
      return NextResponse.json({ errors: [{ message: 'Unauthorized' }] }, { status: 401 })
    }

    const data = await getMembersList()
    return NextResponse.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    return NextResponse.json({ errors: [{ message }] }, { status: 500 })
  }
}
