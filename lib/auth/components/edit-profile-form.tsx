'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

import { Input } from '@components/ui/input'
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
  linkedin_url: string | null
  twitter_url: string | null
  github_url: string | null
  website_url: string | null
  instagram_url: string | null
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
      linkedinUrl: (formData.get('linkedinUrl') as string) || '',
      twitterUrl: (formData.get('twitterUrl') as string) || '',
      githubUrl: (formData.get('githubUrl') as string) || '',
      websiteUrl: (formData.get('websiteUrl') as string) || '',
      instagramUrl: (formData.get('instagramUrl') as string) || '',
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

  const hasSocials =
    profile.linkedin_url ||
    profile.twitter_url ||
    profile.github_url ||
    profile.website_url ||
    profile.instagram_url

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
          {hasSocials && (
            <div className="px-6 py-4">
              <span className="text-xs text-tag-muted">Socials</span>
              <div className="mt-2 flex flex-wrap gap-3">
                {profile.linkedin_url && (
                  <a
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-tag-orange transition-colors hover:text-tag-orange/80"
                  >
                    LinkedIn
                  </a>
                )}
                {profile.twitter_url && (
                  <a
                    href={profile.twitter_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-tag-orange transition-colors hover:text-tag-orange/80"
                  >
                    Twitter/X
                  </a>
                )}
                {profile.github_url && (
                  <a
                    href={profile.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-tag-orange transition-colors hover:text-tag-orange/80"
                  >
                    GitHub
                  </a>
                )}
                {profile.website_url && (
                  <a
                    href={profile.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-tag-orange transition-colors hover:text-tag-orange/80"
                  >
                    Website
                  </a>
                )}
                {profile.instagram_url && (
                  <a
                    href={profile.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-tag-orange transition-colors hover:text-tag-orange/80"
                  >
                    Instagram
                  </a>
                )}
              </div>
            </div>
          )}
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

            <div className="space-y-3">
              <Label className={labelClass}>Socials</Label>
              <Input
                name="linkedinUrl"
                type="url"
                defaultValue={profile.linkedin_url ?? ''}
                placeholder="https://linkedin.com/in/you"
                className={inputClass}
              />
              <Input
                name="twitterUrl"
                type="url"
                defaultValue={profile.twitter_url ?? ''}
                placeholder="https://x.com/you"
                className={inputClass}
              />
              <Input
                name="githubUrl"
                type="url"
                defaultValue={profile.github_url ?? ''}
                placeholder="https://github.com/you"
                className={inputClass}
              />
              <Input
                name="websiteUrl"
                type="url"
                defaultValue={profile.website_url ?? ''}
                placeholder="https://yoursite.com"
                className={inputClass}
              />
              <Input
                name="instagramUrl"
                type="url"
                defaultValue={profile.instagram_url ?? ''}
                placeholder="https://instagram.com/you"
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
