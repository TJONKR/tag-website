import { NextResponse } from 'next/server'

import { getOptionalUser } from '@lib/auth/queries'
import { createIdeaSchema } from '@lib/ideas/schema'
import { createIdea } from '@lib/ideas/mutations'

export async function POST(req: Request) {
  try {
    const user = await getOptionalUser()

    if (!user) {
      return NextResponse.json({ errors: [{ message: 'Unauthorized' }] }, { status: 401 })
    }

    const body = await req.json()
    const result = createIdeaSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ errors: result.error.issues }, { status: 400 })
    }

    const idea = await createIdea(user.id, result.data)

    return NextResponse.json({ success: true, id: idea.id })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    return NextResponse.json({ errors: [{ message }] }, { status: 500 })
  }
}
