'use client'

import { useState } from 'react'

import { toast } from '@components/toast'
import { Button } from '@components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@components/ui/dialog'

import { signContract } from '../actions'
import { contractSections, CONTRACT_VERSION } from '../contract-template'

interface ContractDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const ContractDialog = ({ open, onOpenChange }: ContractDialogProps) => {
  const [accepted, setAccepted] = useState(false)
  const [signing, setSigning] = useState(false)

  const handleSign = async () => {
    setSigning(true)

    const result = await signContract()

    if (result.status === 'success') {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' })
      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        toast({ type: 'error', description: 'Failed to start checkout.' })
        setSigning(false)
      }
    } else {
      toast({ type: 'error', description: 'Failed to sign contract.' })
      setSigning(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto border-tag-border bg-tag-card sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-syne text-xl text-tag-text">
            Builder Membership Agreement
          </DialogTitle>
          <p className="text-xs text-tag-dim">Version {CONTRACT_VERSION}</p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {contractSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-sm font-semibold text-tag-text">
                {section.title}
              </h4>
              <p className="mt-1 text-sm leading-relaxed text-tag-muted">
                {section.content}
              </p>
            </div>
          ))}
        </div>

        <div className="border-t border-tag-border pt-4">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-1 size-4 rounded border-tag-border accent-tag-orange"
            />
            <span className="text-sm text-tag-muted">
              I have read and agree to the TAG Builder Membership Agreement.
            </span>
          </label>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-tag-border text-tag-muted"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSign}
            disabled={!accepted || signing}
            className="bg-tag-orange text-white hover:bg-tag-orange/90 disabled:opacity-50"
          >
            {signing ? 'Processing...' : 'Sign & Continue to Payment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
