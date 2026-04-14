'use client'

import Form from 'next/form'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { toast } from '@components/toast'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'
import { SubmitButton } from '@lib/auth/components/submit-button'
import { resetPassword } from '@lib/auth/actions'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [isSuccessful, setIsSuccessful] = useState(false)

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

    const result = await resetPassword(password)

    if (result.status === 'success') {
      setIsSuccessful(true)
      toast({
        type: 'success',
        description: 'Password updated! Redirecting to login...',
      })
      setTimeout(() => {
        router.push('/login')
      }, 1500)
    } else {
      toast({
        type: 'error',
        description: result.error ?? 'Something went wrong. Please try again.',
      })
    }
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
