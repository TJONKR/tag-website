import { NextResponse } from 'next/server'

import { getOptionalUser } from '@lib/auth/queries'
import {
  getEventHostApplicationCounts,
  getEventHostApplications,
} from '@lib/event-applications/queries'

import type { EventApplicationStatus } from '@lib/event-applications/types'

export async function GET(req: Request) {
  try {
    const user = await getOptionalUser()

    if (!user || user.role !== 'operator') {
      return NextResponse.json(
        { errors: [{ message: 'Unauthorized' }] },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') as EventApplicationStatus | null
    const countsOnly = searchParams.get('counts') === 'true'

    if (countsOnly) {
      const counts = await getEventHostApplicationCounts()
      return NextResponse.json(counts)
    }

    const applications = await getEventHostApplications(status ?? undefined)
    return NextResponse.json(applications)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    return NextResponse.json({ errors: [{ message }] }, { status: 500 })
  }
}
