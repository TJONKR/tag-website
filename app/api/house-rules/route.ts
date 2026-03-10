import { NextResponse } from 'next/server'

import { getOptionalUser } from '@lib/auth/queries'
import { houseRuleSchema } from '@lib/portal/schema'
import { insertHouseRule } from '@lib/portal/mutations'

export async function POST(req: Request) {
  try {
    const user = await getOptionalUser()

    if (!user || user.role !== 'operator') {
      return NextResponse.json({ errors: [{ message: 'Unauthorized' }] }, { status: 401 })
    }

    const body = await req.json()
    const result = houseRuleSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ errors: result.error.issues }, { status: 400 })
    }

    await insertHouseRule(result.data)

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    console.error('[house-rules POST] Error:', message)
    return NextResponse.json({ errors: [{ message }] }, { status: 500 })
  }
}
