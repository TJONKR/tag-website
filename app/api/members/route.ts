import { NextResponse } from 'next/server'

import { getOptionalUser } from '@lib/auth/queries'
import { createServerSupabaseClient } from '@lib/db'

export async function GET() {
  try {
    const user = await getOptionalUser()

    if (!user || user.role !== 'operator') {
      return NextResponse.json({ errors: [{ message: 'Unauthorized' }] }, { status: 401 })
    }

    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, role')
      .order('name', { ascending: true })

    if (error) throw new Error(error.message)

    return NextResponse.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    return NextResponse.json({ errors: [{ message }] }, { status: 500 })
  }
}
