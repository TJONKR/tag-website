'use client'

import { useState } from 'react'

import { toast } from '@components/toast'
import { Button } from '@components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog'

interface AiAmClaimDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const AiAmClaimDialog = ({ open, onOpenChange }: AiAmClaimDialogProps) => {
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/membership/claim-ai-am', { method: 'POST' })
      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.errors?.[0]?.message ?? 'Failed to submit')
      }

      toast({
        type: 'success',
        description:
          "Claim submitted. We'll verify with AI AM and notify you once approved.",
      })
      onOpenChange(false)
      // Soft refresh so the upgrade card disappears
      window.location.reload()
    } catch (error) {
      toast({
        type: 'error',
        description:
          error instanceof Error ? error.message : 'Something went wrong.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-tag-border bg-tag-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-syne text-xl text-tag-text">
            Claim AI/AM membership
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2 text-sm text-tag-muted">
          <p>
            Use this option if you already have a direct rental contract with{' '}
            <span className="font-semibold text-tag-text">AI AM B.V.</span> for a
            flexible desk at TAG.
          </p>
          <p>
            We&apos;ll verify with AI AM and approve your Builder access. No
            second payment, no extra contract — your existing AI AM agreement
            remains the source of truth.
          </p>
          <p className="text-xs text-tag-dim">
            Approval is manual (Tijs or Pieter) and usually happens within a
            day.
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-tag-border text-tag-muted"
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-tag-orange text-white hover:bg-tag-orange/90 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit claim'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
