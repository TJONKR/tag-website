import { NextResponse } from 'next/server'

import { createServerSupabaseClient } from '@lib/db'

export async function GET() {
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

    const { data, error } = await supabase
      .from('builder_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (error) {
      return NextResponse.json(
        { errors: [{ message: error.message }] },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    console.error('[taste/status] Error:', message)
    return NextResponse.json(
      { errors: [{ message }] },
      { status: 500 }
    )
  }
}
