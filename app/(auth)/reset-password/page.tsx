'use client'

import Form from 'next/form'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { toast } from '@components/toast'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'
import { SubmitButton } from '@lib/auth/components/submit-button'
import { createBrowserSupabaseClient } from '@lib/db/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isSuccessful, setIsSuccessful] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Exchange the auth code for a session on mount
  useEffect(() => {
    const code = searchParams.get('code')

    if (!code) {
      // No code — user might already have a session (direct visit)
      setIsReady(true)
      return
    }

    const exchangeCode = async () => {
      const supabase = createBrowserSupabaseClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        setError('Reset link is invalid or has expired. Please request a new one.')
        toast({
          type: 'error',
          description: 'Reset link is invalid or has expired.',
        })
      } else {
        setIsReady(true)
        // Clean the code from the URL
        router.replace('/reset-password')
      }
    }

    exchangeCode()
  }, [searchParams, router])

  const handleSubmit = async (formData: FormData) => {
    const password = formData.get('password') as string
    const confirm = formData.get('confirm') as string

    if (!password || password.length < 6) {
      toast({ type: 'error', description: 'Password must be at least 6 characters.' })
      return
    }

    if (password !== confirm) {
      toast({ type: 'error', description: 'Passwords do not match.' })
      return
    }

    const supabase = createBrowserSupabaseClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      toast({
        type: 'error',
        description: error.message,
      })
    } else {
      setIsSuccessful(true)
      toast({
        type: 'success',
        description: 'Password updated! Redirecting to login...',
      })
      setTimeout(() => {
        router.push('/login')
      }, 1500)
    }
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-tag-bg p-6">
        <div className="flex w-full max-w-md flex-col gap-6 text-center">
          <h3 className="text-xl font-semibold text-tag-text">Link Expired</h3>
          <p className="text-sm text-tag-muted">{error}</p>
          <a
            href="/forgot-password"
            className="text-sm font-semibold text-tag-text hover:underline"
          >
            Request a new reset link
          </a>
        </div>
      </div>
    )
  }

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-tag-bg p-6">
        <p className="text-sm text-tag-muted">Verifying reset link...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-tag-bg p-6">
      <div className="flex w-full max-w-md flex-col gap-12 overflow-hidden rounded-2xl">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="text-xl font-semibold text-tag-text">New Password</h3>
          <p className="text-sm text-tag-muted">
            Choose a new password for your account
          </p>
        </div>
        <Form action={handleSubmit} className="flex flex-col gap-4 px-4 sm:px-16">
          <div className="flex flex-col gap-2">
            <Label htmlFor="password" className="font-normal text-tag-muted">
              New Password
            </Label>
            <Input
              id="password"
              name="password"
              className="text-md bg-muted md:text-sm"
              type="password"
              required
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="confirm" className="font-normal text-tag-muted">
              Confirm Password
            </Label>
            <Input
              id="confirm"
              name="confirm"
              className="text-md bg-muted md:text-sm"
              type="password"
              required
            />
          </div>

          <SubmitButton isSuccessful={isSuccessful}>Update password</SubmitButton>
        </Form>
      </div>
    </div>
  )
}
