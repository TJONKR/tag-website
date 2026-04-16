'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

import { toast } from '@components/toast'
import { AuthForm } from '@lib/auth/components/auth-form'
import { SubmitButton } from '@lib/auth/components/submit-button'
import { login } from '@lib/auth/actions'
import type { LoginActionState } from '@lib/auth/types'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [isSuccessful, setIsSuccessful] = useState(false)

  const [state, setState] = useState<LoginActionState>({
    status: 'idle',
  })

  const handleSubmit = async (formData: FormData) => {
    setEmail(formData.get('email') as string)
    const result = await login(state, formData)
    setState(result)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-tag-bg p-6">
      <div className="flex w-full max-w-md flex-col gap-12 overflow-hidden rounded-2xl">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="text-xl font-semibold text-tag-text">Sign In</h3>
          <p className="text-sm text-tag-muted">
            Use your email and password to sign in
          </p>
        </div>
        <AuthForm action={handleSubmit} defaultEmail={email}>
          <SubmitButton isSuccessful={isSuccessful}>Sign in</SubmitButton>
          <p className="mt-4 text-center text-sm text-tag-muted">
            <Link
              href="/forgot-password"
              className="font-semibold text-tag-text hover:underline"
            >
              Forgot password?
            </Link>
          </p>
          <p className="text-center text-sm text-tag-muted">
            {'Just approved? '}
            <Link
              href="/signup"
              className="font-semibold text-tag-text hover:underline"
            >
              Set up your account
            </Link>
          </p>
          <p className="text-center text-sm text-tag-muted">
            {'New here? '}
            <Link
              href="/join"
              className="font-semibold text-tag-text hover:underline"
            >
              Apply for membership
            </Link>
          </p>
        </AuthForm>
        <Suspense fallback={null}>
          <LoginRedirectEffects state={state} setIsSuccessful={setIsSuccessful} />
        </Suspense>
      </div>
    </div>
  )
}

function LoginRedirectEffects({
  state,
  setIsSuccessful,
}: {
  state: LoginActionState
  setIsSuccessful: (value: boolean) => void
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!state) {
      return
    }

    if (state.status === 'invalid_credentials') {
      toast({
        type: 'error',
        description: 'Invalid email or password.',
      })
    } else if (state.status === 'email_not_confirmed') {
      toast({
        type: 'error',
        description:
          'Please confirm your email before signing in. Check your inbox for the confirmation link.',
      })
    } else if (state.status === 'rate_limited') {
      toast({
        type: 'error',
        description: 'Too many attempts. Wait a minute and try again.',
      })
    } else if (state.status === 'failed') {
      toast({
        type: 'error',
        description: state.message ?? 'Sign-in failed. Try again.',
      })
    } else if (state.status === 'invalid_data') {
      toast({
        type: 'error',
        description: 'Failed validating your submission!',
      })
    } else if (state.status === 'success') {
      setIsSuccessful(true)

      setTimeout(() => {
        router.refresh()
        const dest = searchParams.get('redirect') || '/portal'
        router.push(dest)
      }, 1000)
    }
  }, [state, router, searchParams, setIsSuccessful])

  return null
}
