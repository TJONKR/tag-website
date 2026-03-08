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
    })

    if (error) {
      throw error
    }

    if (data.user) {
      await supabase.from('profiles').update({ name }).eq('id', data.user.id)
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

export async function signOutAction(): Promise<void> {
  const supabase = await createServerSupabaseClient()
  await supabase.auth.signOut()
}
