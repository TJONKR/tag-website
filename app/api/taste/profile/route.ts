import { NextResponse } from 'next/server'

import { createServerSupabaseClient } from '@lib/db'
import { tasteProfileUpdateSchema } from '@lib/taste/schema'
import { updateTasteFields } from '@lib/taste/mutations'

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
    const result = tasteProfileUpdateSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { errors: result.error.issues },
        { status: 400 }
      )
    }

    // Normalize empty optional strings to undefined on nested objects
    const patch = { ...result.data }
    if (patch.projects) {
      patch.projects = patch.projects.map((p) => ({
        ...p,
        url: p.url && p.url.length > 0 ? p.url : undefined,
        role: p.role && p.role.length > 0 ? p.role : undefined,
      }))
    }

    await updateTasteFields(user.id, patch)

    return NextResponse.json({ ok: true })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Something went wrong'
    console.error('[taste/profile] Error:', message)
    return NextResponse.json({ errors: [{ message }] }, { status: 500 })
  }
}
