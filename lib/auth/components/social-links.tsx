'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Plus, Linkedin, Github, Globe, Instagram } from 'lucide-react'

import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'
import { toast } from '@components/toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@components/ui/dialog'

interface SocialData {
  linkedin_url: string | null
  twitter_url: string | null
  github_url: string | null
  website_url: string | null
  instagram_url: string | null
}

interface SocialLinksProps {
  profile: SocialData
}

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

const labelClass = 'font-mono text-sm uppercase tracking-[0.08em] text-tag-muted'
const inputClass =
  'border-tag-border bg-tag-card text-tag-text placeholder:text-tag-dim focus-visible:ring-tag-orange'

const socialConfig = [
  { key: 'linkedin_url', name: 'linkedinUrl', label: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/in/you' },
  { key: 'twitter_url', name: 'twitterUrl', label: 'X / Twitter', icon: XIcon, placeholder: 'https://x.com/you' },
  { key: 'github_url', name: 'githubUrl', label: 'GitHub', icon: Github, placeholder: 'https://github.com/you' },
  { key: 'website_url', name: 'websiteUrl', label: 'Website', icon: Globe, placeholder: 'https://yoursite.com' },
  { key: 'instagram_url', name: 'instagramUrl', label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/you' },
] as const

export const SocialLinks = ({ profile }: SocialLinksProps) => {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const filledSocials = socialConfig.filter(
    (s) => profile[s.key as keyof SocialData]
  )
  const hasSocials = filledSocials.length > 0

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)

    const formData = new FormData(e.currentTarget)
    const data = {
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

      toast({ type: 'success', description: 'Socials updated.' })
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
      <div className="rounded-lg border border-tag-border bg-tag-card p-4">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-[0.15em] text-tag-dim">
            Socials
          </span>
          <button
            onClick={() => setOpen(true)}
            className="font-mono text-xs uppercase tracking-wider text-tag-muted transition-colors hover:text-tag-text"
          >
            {hasSocials ? 'Edit' : 'Add'}
          </button>
        </div>

        {hasSocials ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {filledSocials.map((s) => {
              const Icon = s.icon
              const url = profile[s.key as keyof SocialData]!
              return (
                <a
                  key={s.key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={s.label}
                  className="group/social flex size-9 items-center justify-center rounded-lg border border-tag-border transition-colors hover:border-tag-orange/50"
                >
                  <Icon className="size-4 text-tag-muted transition-colors group-hover/social:text-tag-orange" />
                </a>
              )
            })}
          </div>
        ) : (
          <button
            onClick={() => setOpen(true)}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-tag-border py-3 text-sm text-tag-muted transition-colors hover:border-tag-orange/50 hover:text-tag-orange"
          >
            <Plus className="size-3" />
            Add your socials
          </button>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto border-tag-border bg-tag-card sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-syne text-tag-text">Edit Socials</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-3">
            {socialConfig.map((s) => (
              <div key={s.key} className="space-y-1">
                <Label htmlFor={`edit-${s.name}`} className={labelClass}>
                  {s.label}
                </Label>
                <Input
                  id={`edit-${s.name}`}
                  name={s.name}
                  type="url"
                  defaultValue={profile[s.key as keyof SocialData] ?? ''}
                  placeholder={s.placeholder}
                  className={inputClass}
                />
              </div>
            ))}

            <DialogFooter className="gap-2 pt-2 sm:gap-0">
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
                className="flex items-center gap-2 rounded-md bg-tag-orange px-4 py-2 font-mono text-sm uppercase tracking-wider text-tag-bg transition-colors hover:bg-tag-orange/90 disabled:opacity-50"
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
