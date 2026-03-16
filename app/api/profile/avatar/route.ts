import { NextResponse } from 'next/server'

import { getOptionalUser } from '@lib/auth/queries'
import { createServerSupabaseClient } from '@lib/db'

export async function POST(req: Request) {
  try {
    const user = await getOptionalUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('avatar') as File
    if (!file || file.size === 0) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'File must be under 2MB' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const path = `${user.id}/avatar.${ext}`

    // Remove old avatar files
    const { data: existing } = await supabase.storage.from('avatars').list(user.id)
    if (existing?.length) {
      await supabase.storage
        .from('avatars')
        .remove(existing.map((f) => `${user.id}/${f.name}`))
    }

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true })

    if (uploadError) throw uploadError

    const {
      data: { publicUrl },
    } = supabase.storage.from('avatars').getPublicUrl(path)

    const avatarUrl = `${publicUrl}?v=${Date.now()}`

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: avatarUrl })
      .eq('id', user.id)

    if (updateError) throw updateError

    return NextResponse.json({ url: avatarUrl })
  } catch (error) {
    console.error('[avatar upload]', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
