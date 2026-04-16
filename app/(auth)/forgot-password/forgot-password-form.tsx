'use client'

import Form from 'next/form'
import Link from 'next/link'
import { useState } from 'react'

import { toast } from '@components/toast'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'
import { SubmitButton } from '@lib/auth/components/submit-button'
import { requestPasswordReset } from '@lib/auth/actions'

export const ForgotPasswordForm = () => {
  const [isSuccessful, setIsSuccessful] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    const result = await requestPasswordReset(formData)

    if (result.status === 'invalid') {
      toast({
        type: 'error',
        description: 'Enter a valid email address.',
      })
      return
    }

    setIsSuccessful(true)
    toast({
      type: 'success',
      description: 'If an account exists for that email, a reset link is on its way.',
    })
  }

  if (isSuccessful) {
    return (
      <div className="flex flex-col gap-6 px-4 sm:px-16">
        <p className="text-center text-sm text-tag-muted">
          Check your inbox for a link to reset your password. It can take a minute
          to arrive.
        </p>
        <p className="text-center text-sm text-tag-muted">
          <Link href="/login" className="font-semibold text-tag-text hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Form action={handleSubmit} className="flex flex-col gap-4 px-4 sm:px-16">
        <div className="flex flex-col gap-2">
          <Label htmlFor="email" className="font-normal text-tag-muted">
            Email Address
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            autoFocus
            className="text-md bg-muted md:text-sm"
          />
        </div>

        <SubmitButton isSuccessful={isSuccessful}>Send reset link</SubmitButton>
      </Form>

      <p className="px-4 text-center text-sm text-tag-muted sm:px-16">
        Remembered it?{' '}
        <Link href="/login" className="font-semibold text-tag-text hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
