'use server'

import { createServerSupabaseClient, createServiceRoleClient } from '@lib/db'
import { createOrResetProfile } from '@lib/taste/mutations'
import { runProfilePipeline } from '@lib/taste/pipeline/run'

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
    building: formData.get('building'),
    whyTag: formData.get('whyTag'),
    referral: formData.get('referral') || undefined,
    linkedinUrl: formData.get('linkedinUrl') || '',
    twitterUrl: formData.get('twitterUrl') || '',
    githubUrl: formData.get('githubUrl') || '',
    websiteUrl: formData.get('websiteUrl') || '',
    instagramUrl: formData.get('instagramUrl') || '',
  })

  if (!validatedFields.success) {
    return { status: 'invalid_data' }
  }

  const {
    name,
    email,
    password,
    building,
    whyTag,
    referral,
    linkedinUrl,
    twitterUrl,
    githubUrl,
    websiteUrl,
    instagramUrl,
  } = validatedFields.data

  try {
    const supabase = await createServerSupabaseClient()

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${siteUrl}/auth/callback?next=/portal`,
      },
    })

    if (error) throw error

    // Update profile with additional fields using service role
    // (the trigger creates the profile row, we update it with extras)
    if (data.user) {
      const serviceClient = createServiceRoleClient()
      const { error: profileError } = await serviceClient
        .from('profiles')
        .update({
          building,
          why_tag: whyTag,
          referral: referral || null,
          linkedin_url: linkedinUrl || null,
          twitter_url: twitterUrl || null,
          github_url: githubUrl || null,
          website_url: websiteUrl || null,
          instagram_url: instagramUrl || null,
        })
        .eq('id', data.user.id)

      if (profileError) {
        console.error('[register] Profile update error:', profileError)
      }

      // Fire-and-forget taste evaluation if enough data
      // Call pipeline directly (bypasses API route which requires auth cookies)
      if (twitterUrl || linkedinUrl) {
        const userId = data.user.id
        createOrResetProfile({
          userId,
          name,
          twitterUrl: twitterUrl || null,
          linkedinUrl: linkedinUrl || null,
          githubUrl: githubUrl || null,
          websiteUrl: websiteUrl || null,
          building,
        })
          .then(() =>
            runProfilePipeline({
              userId,
              name,
              twitterUrl,
              linkedinUrl,
              githubUrl,
              websiteUrl,
              building,
            })
          )
          .catch((err) => {
            console.error('[register] Taste evaluation error:', err)
          })
      }
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
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/auth/callback?next=/reset-password`,
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

    const {
      data: { user },
    } = await supabase.auth.getUser()
    console.log('[resetPassword] user:', user?.id ?? 'NO SESSION')

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      console.error('[resetPassword] error:', error.message)
      throw error
    }

    return { status: 'success' }
  } catch (err) {
    console.error('[resetPassword] caught:', err)
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

export async function setPassword(
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

export async function signOutAction(): Promise<void> {
  const supabase = await createServerSupabaseClient()
  await supabase.auth.signOut()
}
