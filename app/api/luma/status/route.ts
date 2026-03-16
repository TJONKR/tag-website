import { NextResponse } from 'next/server'

import { getOptionalUser } from '@lib/auth/queries'
import { createServiceRoleClient } from '@lib/db'

export async function GET() {
  try {
    const user = await getOptionalUser()

    if (!user || user.role !== 'operator') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServiceRoleClient()

    const { data, error } = await supabase
      .from('luma_sync_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      return NextResponse.json({ lastSync: null })
    }

    return NextResponse.json({ lastSync: data })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get status'
    console.error('[luma/status GET] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
