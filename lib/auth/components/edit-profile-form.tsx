'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

import { Textarea } from '@components/ui/textarea'
import { toast } from '@components/toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@components/ui/dialog'

interface ProfileFieldProps {
  label: string
  fieldName: string
  apiKey: string
  value: string | null
  placeholder: string
}

const ProfileField = ({ label, fieldName, apiKey, value, placeholder }: ProfileFieldProps) => {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)

    const formData = new FormData(e.currentTarget)
    const data = { [apiKey]: formData.get(fieldName) as string }

    try {
      const res = await fetch('/api/profile/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const json = await res.json()
        toast({ type: 'error', description: json.errors?.[0]?.message || 'Something went wrong.' })
        return
      }

      toast({ type: 'success', description: `${label} updated.` })
      setOpen(false)
      router.refresh()
    } catch {
      toast({ type: 'error', description: 'Something went wrong. Try again.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="rounded-lg border border-tag-border bg-tag-card">
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <span className="font-mono text-xs uppercase tracking-[0.15em] text-tag-dim">
            {label}
          </span>
          <button
            onClick={() => setOpen(true)}
            className="font-mono text-xs uppercase tracking-wider text-tag-muted transition-colors hover:text-tag-text"
          >
            Edit
          </button>
        </div>
        <div className="px-6 pb-5">
          <p className="whitespace-pre-wrap text-sm text-tag-text">
            {value || 'Not set'}
          </p>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto border-tag-border bg-tag-card sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-syne text-tag-text">{label}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave}>
            <Textarea
              id={`edit-${fieldName}`}
              name={fieldName}
              rows={3}
              defaultValue={value ?? ''}
              placeholder={placeholder}
              className="border-tag-border bg-tag-card text-tag-text placeholder:text-tag-dim focus-visible:ring-tag-orange"
            />
            <DialogFooter className="mt-4 gap-2 sm:gap-0">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md border border-tag-border px-4 py-2 font-mono text-xs uppercase tracking-wider text-tag-muted transition-colors hover:text-tag-text"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-md bg-tag-orange px-4 py-2 font-mono text-xs uppercase tracking-wider text-tag-bg transition-colors hover:bg-tag-orange/90 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="size-3 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save'
                )}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

interface EditProfileFormProps {
  profile: {
    building: string | null
    why_tag: string | null
  }
}

export const EditProfileForm = ({ profile }: EditProfileFormProps) => {
  return (
    <div className="space-y-6">
      <ProfileField
        label="What are you building?"
        fieldName="building"
        apiKey="building"
        value={profile.building}
        placeholder="Side projects, startups, experiments..."
      />
      <ProfileField
        label="Why TAG?"
        fieldName="whyTag"
        apiKey="whyTag"
        value={profile.why_tag}
        placeholder="What drew you here?"
      />
    </div>
  )
}
