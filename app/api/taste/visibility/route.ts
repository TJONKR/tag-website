import { NextResponse } from 'next/server'

import { createServerSupabaseClient } from '@lib/db'
import { visibilityUpdateSchema } from '@lib/taste/schema'
import { updateVisibility } from '@lib/taste/mutations'

export async function PATCH(req: Request) {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { errors: [{ message: 'Unauthorized' }] },
        { status: 401 }
      )
    }

    const body = await req.json()
    const result = visibilityUpdateSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { errors: result.error.issues },
        { status: 400 }
      )
    }

    await updateVisibility(user.id, result.data.field, result.data.value)

    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    console.error('[taste/visibility] Error:', message)
    return NextResponse.json(
      { errors: [{ message }] },
      { status: 500 }
    )
  }
}
