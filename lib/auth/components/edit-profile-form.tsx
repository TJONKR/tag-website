'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

import { Textarea } from '@components/ui/textarea'
import { Label } from '@components/ui/label'
import { toast } from '@components/toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@components/ui/dialog'

interface ProfileData {
  building: string | null
  why_tag: string | null
}

interface EditProfileFormProps {
  profile: ProfileData
}

const labelClass = 'font-mono text-[12px] uppercase tracking-[0.08em] text-tag-muted'
const inputClass =
  'border-tag-border bg-tag-card text-tag-text placeholder:text-tag-dim focus-visible:ring-tag-orange'

export const EditProfileForm = ({ profile }: EditProfileFormProps) => {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      building: formData.get('building') as string,
      whyTag: formData.get('whyTag') as string,
    }

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

      toast({ type: 'success', description: 'Profile updated.' })
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
      {/* Display section */}
      <div className="rounded-lg border border-tag-border bg-tag-card">
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-tag-dim">
            About
          </span>
          <button
            onClick={() => setOpen(true)}
            className="font-mono text-[11px] uppercase tracking-wider text-tag-muted transition-colors hover:text-tag-text"
          >
            Edit
          </button>
        </div>
        <div className="divide-y divide-tag-border">
          <div className="px-6 py-4">
            <span className="text-xs text-tag-muted">What are you building?</span>
            <p className="mt-1 whitespace-pre-wrap text-sm text-tag-text">
              {profile.building || 'Not set'}
            </p>
          </div>
          <div className="px-6 py-4">
            <span className="text-xs text-tag-muted">Why TAG?</span>
            <p className="mt-1 whitespace-pre-wrap text-sm text-tag-text">
              {profile.why_tag || 'Not set'}
            </p>
          </div>
        </div>
      </div>

      {/* Edit dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto border-tag-border bg-tag-card sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-syne text-tag-text">Edit Profile</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="edit-building" className={labelClass}>
                What are you building?
              </Label>
              <Textarea
                id="edit-building"
                name="building"
                rows={3}
                defaultValue={profile.building ?? ''}
                placeholder="Side projects, startups, experiments..."
                className={inputClass}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-whyTag" className={labelClass}>
                Why TAG?
              </Label>
              <Textarea
                id="edit-whyTag"
                name="whyTag"
                rows={2}
                defaultValue={profile.why_tag ?? ''}
                placeholder="What drew you here?"
                className={inputClass}
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
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
