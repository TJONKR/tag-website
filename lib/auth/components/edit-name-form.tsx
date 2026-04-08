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
import { updateName } from '@lib/auth/actions'

interface EditNameFormProps {
  currentName: string | null
}

export const EditNameForm = ({ currentName }: EditNameFormProps) => {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(currentName ?? '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) {
      toast({ type: 'error', description: 'Name cannot be empty.' })
      return
    }

    setSaving(true)
    const result = await updateName(name.trim())
    setSaving(false)

    if (result.status === 'success') {
      toast({ type: 'success', description: 'Name updated.' })
      setOpen(false)
      router.refresh()
    } else {
      toast({ type: 'error', description: 'Something went wrong.' })
    }
  }

  return (
    <>
      <button
        onClick={() => {
          setName(currentName ?? '')
          setOpen(true)
        }}
        className="w-full text-left"
      >
        <div className="flex items-center justify-between py-3">
          <div>
            <span className="text-sm text-tag-muted">Name</span>
            <p className="text-sm text-tag-text">{currentName || 'Not set'}</p>
          </div>
          <span className="font-mono text-xs uppercase tracking-wider text-tag-muted">
            Edit
          </span>
        </div>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-tag-border bg-tag-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-syne text-tag-text">Edit Name</DialogTitle>
          </DialogHeader>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-muted text-sm"
            placeholder="Your name"
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
