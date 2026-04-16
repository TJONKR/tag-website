'use client'

import Form from 'next/form'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { toast } from '@components/toast'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'
import { SubmitButton } from '@lib/auth/components/submit-button'
import { signup } from '@lib/auth/actions'

export const SignupForm = () => {
  const router = useRouter()
  const [isSuccessful, setIsSuccessful] = useState(false)
  const [confirmEmail, setConfirmEmail] = useState<string | null>(null)

  const handleSubmit = async (formData: FormData) => {
    const email = String(formData.get('email') ?? '')
      .trim()
      .toLowerCase()
    const result = await signup(formData)

    if (result.status === 'success') {
      setIsSuccessful(true)
      router.refresh()
      router.push('/portal/onboarding')
      return
    }

    if (result.status === 'confirmation_required') {
      setConfirmEmail(email)
      return
    }

    if (result.status === 'invalid') {
      toast({
        type: 'error',
        description: 'Check your name, email, and a password of at least 8 characters.',
      })
      return
    }

    if (result.status === 'no_match') {
      toast({
        type: 'error',
        description:
          "We couldn't find an approved application for that email. Apply for membership or check the email you applied with.",
      })
      return
    }

    if (result.status === 'weak_password') {
      toast({
        type: 'error',
        description:
          result.message ??
          'That password doesn\u2019t meet the requirements. Try a longer or less common password.',
      })
      return
    }

    if (result.status === 'already_registered') {
      toast({
        type: 'error',
        description:
          'An account with that email already exists. Try signing in or resetting your password.',
      })
      return
    }

    toast({
      type: 'error',
      description: result.message ?? 'Something went wrong. Try again.',
    })
  }

  if (confirmEmail) {
    return (
      <div className="flex flex-col gap-4 px-4 text-center sm:px-16">
        <h2 className="font-syne text-xl font-bold text-tag-text">
          Check your email
        </h2>
        <p className="text-sm text-tag-muted">
          We sent a confirmation link to{' '}
          <span className="font-semibold text-tag-text">{confirmEmail}</span>.
          Click it to finish creating your account.
        </p>
        <p className="text-xs text-tag-muted">
          Didn&apos;t get it? Check your spam folder, or{' '}
          <button
            type="button"
            onClick={() => setConfirmEmail(null)}
            className="font-semibold text-tag-text hover:underline"
          >
            try a different email
          </button>
          .
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Form action={handleSubmit} className="flex flex-col gap-4 px-4 sm:px-16">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name" className="font-normal text-tag-muted">
            Name
          </Label>
          <Input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            autoFocus
            className="text-md bg-muted md:text-sm"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="email" className="font-normal text-tag-muted">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            className="text-md bg-muted md:text-sm"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="password" className="font-normal text-tag-muted">
            Password
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            className="text-md bg-muted md:text-sm"
          />
        </div>

        <SubmitButton isSuccessful={isSuccessful}>Create account</SubmitButton>
      </Form>

      <p className="px-4 text-center text-sm text-tag-muted sm:px-16">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-tag-text hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
