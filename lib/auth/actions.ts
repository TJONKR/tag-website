'use server'

import { createServerSupabaseClient } from '@lib/db'

import { loginSchema, registerSchema } from './schema'
import type { LoginActionState, RegisterActionState } from './types'

export async function login(
  prevState: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
  const validatedFields = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validatedFields.success) {
    return { status: 'invalid_data' }
  }

  const { email, password } = validatedFields.data

  try {
    const supabase = await createServerSupabaseClient()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw error
    }

    return { status: 'success' }
  } catch {
    return { status: 'failed' }
  }
}

export async function register(
  prevState: RegisterActionState,
  formData: FormData
): Promise<RegisterActionState> {
  const validatedFields = registerSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validatedFields.success) {
    return { status: 'invalid_data' }
  }

  const { name, email, password } = validatedFields.data

  try {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    })

    if (error) {
      throw error
    }

    return { status: 'success' }
  } catch {
    return { status: 'failed' }
  }
}

export async function forgotPassword(
  email: string
): Promise<{ status: 'success' | 'failed' }> {
  try {
    const supabase = await createServerSupabaseClient()

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/reset-password`,
    })

    if (error) throw error

    return { status: 'success' }
  } catch {
    return { status: 'failed' }
  }
}

export async function resetPassword(
  password: string
): Promise<{ status: 'success' | 'failed' }> {
  try {
    const supabase = await createServerSupabaseClient()

    const { error } = await supabase.auth.updateUser({ password })

    if (error) throw error

    return { status: 'success' }
  } catch {
    return { status: 'failed' }
  }
}

export async function updateName(
  name: string
): Promise<{ status: 'success' | 'failed' }> {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { status: 'failed' }

    const { error } = await supabase
      .from('profiles')
      .update({ name })
      .eq('id', user.id)

    if (error) throw error

    return { status: 'success' }
  } catch {
    return { status: 'failed' }
  }
}

export async function updateAvatar(
  formData: FormData
): Promise<{ status: 'success' | 'failed'; url?: string }> {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { status: 'failed' }

    const file = formData.get('avatar') as File
    if (!file || file.size === 0) return { status: 'failed' }

    if (file.size > 2 * 1024 * 1024) return { status: 'failed' }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const path = `${user.id}/avatar.${ext}`

    // Remove old avatar files (different extensions)
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

    // Append cache-bust to force refresh
    const avatarUrl = `${publicUrl}?v=${Date.now()}`

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: avatarUrl })
      .eq('id', user.id)

    if (updateError) throw updateError

    return { status: 'success', url: avatarUrl }
  } catch {
    return { status: 'failed' }
  }
}

export async function signOutAction(): Promise<void> {
  const supabase = await createServerSupabaseClient()
  await supabase.auth.signOut()
}
