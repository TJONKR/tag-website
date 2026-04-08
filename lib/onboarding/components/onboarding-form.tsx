'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

import { Input } from '@components/ui/input'
import { Textarea } from '@components/ui/textarea'
import { Label } from '@components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select'
import { toast } from '@components/toast'

import type { OnboardingProfile } from '../types'

interface OnboardingFormProps {
  profile: OnboardingProfile
}

const REFERRAL_OPTIONS = ['Twitter/X', 'LinkedIn', 'Friend', 'Event', 'Other']

const labelClass = 'font-mono text-xs uppercase tracking-[0.08em] text-tag-muted'
const inputClass =
  'border-tag-border bg-tag-card text-tag-text placeholder:text-tag-dim focus-visible:ring-tag-orange'

export const OnboardingForm = ({ profile }: OnboardingFormProps) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name') as string,
      building: formData.get('building') as string,
      whyTag: formData.get('whyTag') as string,
      referral: (formData.get('referral') as string) || undefined,
      linkedinUrl: (formData.get('linkedinUrl') as string) || '',
      twitterUrl: (formData.get('twitterUrl') as string) || '',
      githubUrl: (formData.get('githubUrl') as string) || '',
      websiteUrl: (formData.get('websiteUrl') as string) || '',
      instagramUrl: (formData.get('instagramUrl') as string) || '',
      password: (formData.get('password') as string) || '',
    }

    try {
      const res = await fetch('/api/profile/onboarding', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const json = await res.json()

      if (!res.ok) {
        if (json.errors) {
          const fieldErrors: Record<string, string> = {}
          for (const err of json.errors) {
            if (err.path?.[0]) {
              fieldErrors[err.path[0]] = err.message
            }
          }
          setErrors(fieldErrors)
        } else {
          toast({ type: 'error', description: json.errors?.[0]?.message || 'Something went wrong.' })
        }
        return
      }

      toast({ type: 'success', description: 'Welcome to TAG!' })
      router.push('/portal/events')
    } catch {
      toast({ type: 'error', description: 'Something went wrong. Try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-[600px] space-y-8">
      {/* Identity */}
      <div className="space-y-6">
        <h2 className="font-syne text-lg font-bold text-tag-text">About You</h2>

        <div className="space-y-2">
          <Label htmlFor="name" className={labelClass}>
            Name
          </Label>
          <Input
            id="name"
            name="name"
            required
            defaultValue={profile.name ?? ''}
            placeholder="Your name"
            className={inputClass}
          />
          {errors.name && (
            <p className="font-mono text-xs text-red-400">{errors.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="building" className={labelClass}>
            What are you building?
          </Label>
          <Textarea
            id="building"
            name="building"
            required
            rows={4}
            defaultValue={profile.building ?? ''}
            placeholder="Side projects, startups, experiments..."
            className={inputClass}
          />
          {errors.building && (
            <p className="font-mono text-xs text-red-400">{errors.building}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="whyTag" className={labelClass}>
            Why TAG?
          </Label>
          <Textarea
            id="whyTag"
            name="whyTag"
            required
            rows={3}
            defaultValue={profile.why_tag ?? ''}
            placeholder="What drew you here?"
            className={inputClass}
          />
          {errors.whyTag && (
            <p className="font-mono text-xs text-red-400">{errors.whyTag}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="referral" className={labelClass}>
            How did you hear about us?
          </Label>
          <Select name="referral" defaultValue={profile.referral ?? undefined}>
            <SelectTrigger className={inputClass}>
              <SelectValue placeholder="Select one (optional)" />
            </SelectTrigger>
            <SelectContent className="border-tag-border bg-tag-card">
              {REFERRAL_OPTIONS.map((option) => (
                <SelectItem
                  key={option}
                  value={option}
                  className="text-tag-text focus:bg-tag-border focus:text-tag-text"
                >
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Socials */}
      <div className="space-y-6">
        <h2 className="font-syne text-lg font-bold text-tag-text">Socials</h2>
        <p className="font-grotesk text-sm text-tag-muted">
          Add your socials so other builders can find you. All optional.
        </p>

        <div className="space-y-2">
          <Label htmlFor="linkedinUrl" className={labelClass}>
            LinkedIn
          </Label>
          <Input
            id="linkedinUrl"
            name="linkedinUrl"
            type="url"
            defaultValue={profile.linkedin_url ?? ''}
            placeholder="https://linkedin.com/in/you"
            className={inputClass}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="twitterUrl" className={labelClass}>
            Twitter / X
          </Label>
          <Input
            id="twitterUrl"
            name="twitterUrl"
            type="url"
            defaultValue={profile.twitter_url ?? ''}
            placeholder="https://x.com/you"
            className={inputClass}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="githubUrl" className={labelClass}>
            GitHub
          </Label>
          <Input
            id="githubUrl"
            name="githubUrl"
            type="url"
            defaultValue={profile.github_url ?? ''}
            placeholder="https://github.com/you"
            className={inputClass}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="websiteUrl" className={labelClass}>
            Website
          </Label>
          <Input
            id="websiteUrl"
            name="websiteUrl"
            type="url"
            defaultValue={profile.website_url ?? ''}
            placeholder="https://yoursite.com"
            className={inputClass}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="instagramUrl" className={labelClass}>
            Instagram
          </Label>
          <Input
            id="instagramUrl"
            name="instagramUrl"
            type="url"
            defaultValue={profile.instagram_url ?? ''}
            placeholder="https://instagram.com/you"
            className={inputClass}
          />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-6">
        <h2 className="font-syne text-lg font-bold text-tag-text">Set a Password</h2>
        <p className="font-grotesk text-sm text-tag-muted">
          Set a password so you can log in with email and password going forward.
        </p>

        <div className="space-y-2">
          <Label htmlFor="password" className={labelClass}>
            Password
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="At least 6 characters"
            className={inputClass}
          />
          {errors.password && (
            <p className="font-mono text-xs text-red-400">{errors.password}</p>
          )}
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="flex items-center gap-2 bg-tag-orange px-8 py-3 font-grotesk font-medium text-tag-bg-deep transition-colors hover:bg-[#e8551b] disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Saving...
          </>
        ) : (
          'Complete Setup \u2192'
        )}
      </button>
    </form>
  )
}
