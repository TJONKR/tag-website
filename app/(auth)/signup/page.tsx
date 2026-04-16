import { redirect } from 'next/navigation'

import { createServerSupabaseClient } from '@lib/db'

import { SignupForm } from './signup-form'

export default async function SignupPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/portal')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-tag-bg p-6">
      <div className="flex w-full max-w-md flex-col gap-12 overflow-hidden rounded-2xl">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="text-xl font-semibold text-tag-text">Set up your account</h3>
          <p className="text-sm text-tag-muted">
            Use the email you applied with.
          </p>
        </div>
        <SignupForm />
      </div>
    </div>
  )
}
