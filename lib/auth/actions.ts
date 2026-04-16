'use server'

import { headers } from 'next/headers'

import { createServerSupabaseClient, createServiceRoleClient } from '@lib/db'

import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
} from './schema'
import type { LoginActionState } from './types'

export type SignupResult = { status: 'success' | 'invalid' | 'no_match' | 'failed' }

export async function signup(formData: FormData): Promise<SignupResult> {
  const parsed = signupSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return { status: 'invalid' }
  }

  const { name, password } = parsed.data
  const email = parsed.data.email.trim().toLowerCase()

  try {
    const serviceClient = createServiceRoleClient()

    // Pick the most recent accepted application for this email. Users may apply
    // more than once; we want the latest approval.
    const { data: applications, error: lookupError } = await serviceClient
      .from('applications')
      .select('id, status')
      .ilike('email', email)
      .eq('status', 'accepted')
      .order('created_at', { ascending: false })
      .limit(1)

    if (lookupError) {
      console.error('[signup] application lookup failed:', lookupError.message)
      return { status: 'failed' }
    }

    const application = applications?.[0]
    if (!application) {
      console.warn('[signup] no accepted application found for email:', email)
      return { status: 'no_match' }
    }

    const supabase = await createServerSupabaseClient()

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, application_id: application.id },
      },
    })

    if (signUpError) {
      console.warn('[signup] signUp error:', signUpError.message)
      return { status: 'no_match' }
    }

    return { status: 'success' }
  } catch (error) {
    console.error('[signup] unexpected error:', error)
    return { status: 'failed' }
  }
}

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
  } catch (error) {
    console.error('[updateAvatar] Error:', error)
    return { status: 'failed' }
  }
}

export async function signOutAction(): Promise<void> {
  const supabase = await createServerSupabaseClient()
  await supabase.auth.signOut()
}

export type RequestPasswordResetResult = { status: 'success' | 'invalid' }

export async function requestPasswordReset(
  formData: FormData
): Promise<RequestPasswordResetResult> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get('email'),
  })

  if (!parsed.success) {
    return { status: 'invalid' }
  }

  const email = parsed.data.email.trim().toLowerCase()

  try {
    const supabase = await createServerSupabaseClient()
    const headerList = await headers()
    const host = headerList.get('host')
    const protocol = headerList.get('x-forwarded-proto') ?? 'https'
    const origin =
      process.env.NEXT_PUBLIC_SITE_URL ?? (host ? `${protocol}://${host}` : '')
    const redirectTo = `${origin}/reset-password`

    await supabase.auth.resetPasswordForEmail(email, { redirectTo })
  } catch (error) {
    console.error('[requestPasswordReset] unexpected error:', error)
  }

  // Always return success to avoid leaking which emails have accounts.
  return { status: 'success' }
}

export type UpdatePasswordResult = {
  status: 'success' | 'invalid' | 'unauthenticated' | 'failed'
}

export async function updatePassword(
  formData: FormData
): Promise<UpdatePasswordResult> {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return { status: 'invalid' }
  }

  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { status: 'unauthenticated' }

    const { error } = await supabase.auth.updateUser({
      password: parsed.data.password,
    })

    if (error) {
      console.warn('[updatePassword] updateUser error:', error.message)
      return { status: 'failed' }
    }

    return { status: 'success' }
  } catch (error) {
    console.error('[updatePassword] unexpected error:', error)
    return { status: 'failed' }
  }
}
