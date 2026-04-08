import { NextResponse } from 'next/server'
import { z } from 'zod'

import { getOptionalUser } from '@lib/auth/queries'
import { confirmAvatar } from '@lib/avatar/mutations'

const confirmSchema = z.object({
  jobId: z.string().uuid(),
})

export async function POST(req: Request) {
  try {
    const user = await getOptionalUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = confirmSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    await confirmAvatar(user.id, parsed.data.jobId)

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to confirm avatar'
    console.error('[avatar/confirm POST]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
