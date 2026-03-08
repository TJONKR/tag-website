'use client'

import Form from 'next/form'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { toast } from '@components/toast'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'
import { SubmitButton } from '@lib/auth/components/submit-button'
import { register } from '@lib/auth/actions'
import type { RegisterActionState } from '@lib/auth/types'

export default function RegisterPage() {
  const router = useRouter()
  const [isSuccessful, setIsSuccessful] = useState(false)

  const [state, setState] = useState<RegisterActionState>({
    status: 'idle',
  })

  const handleSubmit = async (formData: FormData) => {
    const result = await register(state, formData)
    setState(result)

    if (result.status === 'success') {
      setIsSuccessful(true)
      toast({
        type: 'success',
        description: 'Account created! You can now sign in.',
      })
      setTimeout(() => {
        router.push('/login')
      }, 1500)
    } else if (result.status === 'failed') {
      toast({
        type: 'error',
        description: 'Something went wrong. Please try again.',
      })
    } else if (result.status === 'invalid_data') {
      toast({
        type: 'error',
        description: 'Please fill in all fields correctly.',
      })
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-tag-bg p-6">
      <div className="flex w-full max-w-md flex-col gap-12 overflow-hidden rounded-2xl">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="text-xl font-semibold text-tag-text">Sign Up</h3>
          <p className="text-sm text-tag-muted">
            Create an account to join the TAG community
          </p>
        </div>
        <Form action={handleSubmit} className="flex flex-col gap-4 px-4 sm:px-16">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name" className="font-normal text-tag-muted">
              Name
            </Label>
            <Input
              id="name"
              name="name"
              className="text-md bg-muted md:text-sm"
              type="text"
              placeholder="Your name"
              autoComplete="name"
              required
              autoFocus
            />
          </div>

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
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password" className="font-normal text-tag-muted">
              Password
            </Label>
            <Input
              id="password"
              name="password"
              className="text-md bg-muted md:text-sm"
              type="password"
              required
            />
          </div>

          <SubmitButton isSuccessful={isSuccessful}>Sign up</SubmitButton>
          <p className="mt-4 text-center text-sm text-tag-muted">
            {'Already have an account? '}
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
