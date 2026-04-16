'use client'

import Form from 'next/form'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { toast } from '@components/toast'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'
import { SubmitButton } from '@lib/auth/components/submit-button'
import { updatePassword } from '@lib/auth/actions'

export const ResetPasswordForm = () => {
  const router = useRouter()
  const [isSuccessful, setIsSuccessful] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    const result = await updatePassword(formData)

    if (result.status === 'invalid') {
      toast({
        type: 'error',
        description: 'Password must be at least 8 characters.',
      })
      return
    }

    if (result.status === 'unauthenticated') {
      toast({
        type: 'error',
        description: 'Your reset link has expired. Request a new one.',
      })
      router.push('/forgot-password')
      return
    }

    if (result.status === 'failed') {
      toast({ type: 'error', description: 'Something went wrong. Try again.' })
      return
    }

    setIsSuccessful(true)
    toast({ type: 'success', description: 'Password updated.' })
    router.refresh()
    router.push('/portal')
  }

  return (
    <Form action={handleSubmit} className="flex flex-col gap-4 px-4 sm:px-16">
      <div className="flex flex-col gap-2">
        <Label htmlFor="password" className="font-normal text-tag-muted">
          New password
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          autoFocus
          className="text-md bg-muted md:text-sm"
        />
      </div>

      <SubmitButton isSuccessful={isSuccessful}>Update password</SubmitButton>
    </Form>
  )
}
