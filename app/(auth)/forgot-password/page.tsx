'use client'

import Form from 'next/form'
import Link from 'next/link'
import { useState } from 'react'

import { toast } from '@components/toast'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'
import { SubmitButton } from '@lib/auth/components/submit-button'
import { forgotPassword } from '@lib/auth/actions'

export default function ForgotPasswordPage() {
  const [isSuccessful, setIsSuccessful] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    const email = formData.get('email') as string

    if (!email) {
      toast({ type: 'error', description: 'Please enter your email address.' })
      return
    }

    const result = await forgotPassword(email)

    if (result.status === 'success') {
      setIsSuccessful(true)
      toast({
        type: 'success',
        description: 'Check your email for a reset link.',
      })
    } else {
      toast({
        type: 'error',
        description: 'Something went wrong. Please try again.',
      })
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-tag-bg p-6">
      <div className="flex w-full max-w-md flex-col gap-12 overflow-hidden rounded-2xl">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="text-xl font-semibold text-tag-text">Reset Password</h3>
          <p className="text-sm text-tag-muted">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>
        <Form action={handleSubmit} className="flex flex-col gap-4 px-4 sm:px-16">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email" className="font-normal text-tag-muted">
              Email Address
            </Label>
            <Input
              id="email"
              name="email"
              className="text-md bg-muted md:text-sm"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
              autoFocus
            />
          </div>

          <SubmitButton isSuccessful={isSuccessful}>Send reset link</SubmitButton>
          <p className="mt-4 text-center text-sm text-tag-muted">
            {'Remember your password? '}
            <Link
              href="/login"
              className="font-semibold text-tag-text hover:underline"
            >
              Sign in
            </Link>
          </p>
        </Form>
      </div>
    </div>
  )
}
