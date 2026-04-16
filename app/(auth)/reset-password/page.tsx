import { redirect } from 'next/navigation'

import { createServerSupabaseClient } from '@lib/db'

import { ResetPasswordForm } from './reset-password-form'

export default async function ResetPasswordPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/forgot-password')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-tag-bg p-6">
      <div className="flex w-full max-w-md flex-col gap-12 overflow-hidden rounded-2xl">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="text-xl font-semibold text-tag-text">Set a new password</h3>
          <p className="text-sm text-tag-muted">
            Choose a password with at least 8 characters.
          </p>
        </div>
        <ResetPasswordForm />
      </div>
    </div>
  )
}
