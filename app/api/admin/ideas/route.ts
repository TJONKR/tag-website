import { NextResponse } from 'next/server'

import { getOptionalUser } from '@lib/auth/queries'
import { getAllIdeas } from '@lib/ideas/queries'
import { ideaStatusEnum } from '@lib/ideas/schema'

export async function GET(req: Request) {
  try {
    const user = await getOptionalUser()

    if (!user || !user.is_super_admin) {
      return NextResponse.json(
        { errors: [{ message: 'Forbidden' }] },
        { status: 403 }
      )
    }

    const url = new URL(req.url)
    const statusParam = url.searchParams.get('status')

    if (statusParam) {
      const parsed = ideaStatusEnum.safeParse(statusParam)
      if (!parsed.success) {
        return NextResponse.json(
          { errors: [{ message: 'Invalid status filter' }] },
          { status: 400 }
        )
      }
      const ideas = await getAllIdeas(parsed.data)
      return NextResponse.json(ideas)
    }

    const ideas = await getAllIdeas()
    return NextResponse.json(ideas)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    return NextResponse.json({ errors: [{ message }] }, { status: 500 })
  }
}
