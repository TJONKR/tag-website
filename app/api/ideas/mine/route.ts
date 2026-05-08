import { NextResponse } from 'next/server'

import { getOptionalUser } from '@lib/auth/queries'
import { getIdeasByUser } from '@lib/ideas/queries'

export async function GET() {
  try {
    const user = await getOptionalUser()

    if (!user) {
      return NextResponse.json({ errors: [{ message: 'Unauthorized' }] }, { status: 401 })
    }

    const ideas = await getIdeasByUser(user.id)

    return NextResponse.json(ideas)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    return NextResponse.json({ errors: [{ message }] }, { status: 500 })
  }
}
