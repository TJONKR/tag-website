import { NextResponse } from 'next/server'

import { getOptionalUser } from '@lib/auth/queries'
import { getAvatarJob } from '@lib/avatar/mutations'

export async function GET(req: Request) {
  try {
    const user = await getOptionalUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const jobId = searchParams.get('jobId')

    if (!jobId) {
      return NextResponse.json({ error: 'Missing jobId parameter' }, { status: 400 })
    }

    const job = await getAvatarJob(jobId)

    if (!job || job.user_id !== user.id) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    return NextResponse.json(job)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get avatar status'
    console.error('[avatar/status GET]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
