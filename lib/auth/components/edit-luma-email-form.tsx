'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { toast } from '@components/toast'
import { Input } from '@components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@components/ui/dialog'
import { updateLumaEmail } from '@lib/auth/actions'

interface EditLumaEmailFormProps {
  currentLumaEmail: string | null
  defaultEmail: string
}

export const EditLumaEmailForm = ({
  currentLumaEmail,
  defaultEmail,
}: EditLumaEmailFormProps) => {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState(currentLumaEmail ?? defaultEmail)
  const [saving, setSaving] = useState(false)

  const display = currentLumaEmail ?? defaultEmail

  const handleSave = async () => {
    setSaving(true)
    const result = await updateLumaEmail(email)
    setSaving(false)

    if (result.status === 'success') {
      toast({ type: 'success', description: 'Luma email updated.' })
      setOpen(false)
      router.refresh()
    } else if (result.status === 'invalid') {
      toast({ type: 'error', description: 'Please enter a valid email.' })
    } else {
      toast({ type: 'error', description: 'Something went wrong.' })
    }
  }

  return (
    <>
      <button
        onClick={() => {
          setEmail(currentLumaEmail ?? defaultEmail)
          setOpen(true)
        }}
        className="w-full text-left"
      >
        <div className="flex items-center justify-between py-3">
          <div>
            <span className="text-sm text-tag-muted">Luma email</span>
            <p className="text-sm text-tag-text">{display}</p>
            <p className="mt-1 text-xs text-tag-dim">
              So we can link your TAG account with your Luma account and know which events you have attended.
            </p>
          </div>
          <span className="font-mono text-xs uppercase tracking-wider text-tag-muted">Edit</span>
        </div>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-tag-border bg-tag-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-syne text-tag-text">Luma email</DialogTitle>
          </DialogHeader>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-muted text-sm"
            placeholder={defaultEmail}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave()
            }}
          />
          <DialogFooter className="gap-2 sm:gap-0">
            <button
              onClick={() => setOpen(false)}
              className="rounded-md border border-tag-border px-4 py-2 font-mono text-xs uppercase tracking-wider text-tag-muted transition-colors hover:text-tag-text"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-md bg-tag-orange px-4 py-2 font-mono text-sm uppercase tracking-wider text-tag-bg transition-colors hover:bg-tag-orange/90 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
