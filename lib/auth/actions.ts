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

async function getOrigin(): Promise<string> {
  const headerList = await headers()
  const host = headerList.get('host')
  const protocol = headerList.get('x-forwarded-proto') ?? 'https'
  return process.env.NEXT_PUBLIC_SITE_URL ?? (host ? `${protocol}://${host}` : '')
}

export type SignupResult = {
  status:
    | 'success'
    | 'confirmation_required'
    | 'invalid'
    | 'no_match'
    | 'already_registered'
    | 'weak_password'
    | 'failed'
  message?: string
}

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
      // Diagnostic query: was there ANY application for this email? Useful for
      // distinguishing "wrong email", "pending review", "rejected", and
      // "stored with stray whitespace" — all of which look identical to the
      // user otherwise.
      const { data: anyMatches } = await serviceClient
        .from('applications')
        .select('id, email, status, created_at')
        .ilike('email', `%${email}%`)
        .order('created_at', { ascending: false })
        .limit(5)

      if (!anyMatches || anyMatches.length === 0) {
        console.warn(
          '[signup] no_match: no application of any status for email:',
          email
        )
      } else {
        const summary = anyMatches.map((a) => ({
          id: a.id,
          email: a.email,
          status: a.status,
          created_at: a.created_at,
        }))
        console.warn(
          '[signup] no_match: found applications but none accepted for email:',
          email,
          summary
        )
      }

      return { status: 'no_match' }
    }

    const supabase = await createServerSupabaseClient()
    const origin = await getOrigin()

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, application_id: application.id },
        emailRedirectTo: `${origin}/auth/callback?next=/portal/onboarding`,
      },
    })

    if (signUpError) {
      console.warn(
        '[signup] signUp error:',
        signUpError.code,
        signUpError.message
      )

      const code = signUpError.code
      const msg = signUpError.message.toLowerCase()

      if (code === 'weak_password' || msg.includes('password')) {
        return { status: 'weak_password', message: signUpError.message }
      }

      if (
        code === 'user_already_exists' ||
        msg.includes('already registered') ||
        msg.includes('already been registered')
      ) {
        return { status: 'already_registered' }
      }

      return { status: 'failed', message: signUpError.message }
    }

    // Supabase obfuscates "user already exists" when email confirmation is on
    // by returning success with an empty identities array. Treat as already
    // registered server-side (logged) but show the confirmation screen to the
    // user so we don't leak which emails have accounts.
    const identities = signUpData.user?.identities
    if (identities && identities.length === 0) {
      console.warn('[signup] email already registered (obfuscated):', email)
      return { status: 'confirmation_required' }
    }

    // No session means email confirmation is required by the Supabase project.
    if (!signUpData.session) {
      return { status: 'confirmation_required' }
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

  const { password } = validatedFields.data
  const email = validatedFields.data.email.trim().toLowerCase()

  try {
    const supabase = await createServerSupabaseClient()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.warn('[login] signIn error:', error.code, error.message)

      const code = error.code
      const msg = error.message.toLowerCase()

      if (code === 'email_not_confirmed' || msg.includes('email not confirmed')) {
        return { status: 'email_not_confirmed' }
      }

      if (
        code === 'invalid_credentials' ||
        msg.includes('invalid login credentials') ||
        msg.includes('invalid credentials')
      ) {
        return { status: 'invalid_credentials' }
      }

      if (
        code === 'over_request_rate_limit' ||
        msg.includes('rate limit') ||
        error.status === 429
      ) {
        return { status: 'rate_limited' }
      }

      return { status: 'failed', message: error.message }
    }

    return { status: 'success' }
  } catch (error) {
    console.error('[login] unexpected error:', error)
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
    const origin = await getOrigin()
    const redirectTo = `${origin}/auth/callback?next=/reset-password`

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
