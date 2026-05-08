'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, RotateCcw } from 'lucide-react'

import { ConfirmDialog } from '@components/confirm-dialog'
import { toast } from '@components/toast'

export const ResetOnboardingButton = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleReset = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/profile/onboarding/reset', { method: 'POST' })
      if (!res.ok) throw new Error()
      toast({ type: 'success', description: 'Onboarding reset.' })
      router.push('/portal/onboarding')
    } catch {
      toast({ type: 'error', description: 'Failed to reset onboarding.' })
      setLoading(false)
    }
  }

  return (
    <ConfirmDialog
      trigger={
        <button
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-md border border-tag-border px-3 py-1.5 font-mono text-xs uppercase tracking-[0.12em] text-tag-muted transition-colors hover:border-tag-orange/30 hover:text-tag-orange disabled:opacity-50"
        >
          {loading ? <Loader2 className="size-3.5 animate-spin" /> : <RotateCcw className="size-3.5" />}
          Reset onboarding
        </button>
      }
      title="Reset your onboarding?"
      description="You'll be taken back to the onboarding flow. Your profile data stays untouched."
      onConfirm={handleReset}
    />
  )
}
