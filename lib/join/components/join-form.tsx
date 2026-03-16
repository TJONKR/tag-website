'use client'

import { useState } from 'react'

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

import type { JoinInput } from '@lib/join/schema'

const REFERRAL_OPTIONS = ['Twitter/X', 'LinkedIn', 'Friend', 'Event', 'Other']

const labelClass = 'font-mono text-[12px] uppercase tracking-[0.08em] text-tag-muted'

const inputClass =
  'border-tag-border bg-tag-card text-tag-text placeholder:text-tag-dim focus-visible:ring-tag-orange'

export const JoinForm = () => {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    const formData = new FormData(e.currentTarget)
    const data: JoinInput = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      building: formData.get('building') as string,
      whyTag: formData.get('whyTag') as string,
      referral: (formData.get('referral') as string) || undefined,
      linkedinUrl: (formData.get('linkedinUrl') as string) || '',
      twitterUrl: (formData.get('twitterUrl') as string) || '',
      githubUrl: (formData.get('githubUrl') as string) || '',
      websiteUrl: (formData.get('websiteUrl') as string) || '',
      instagramUrl: (formData.get('instagramUrl') as string) || '',
    }

    try {
      const res = await fetch('/api/join', {
        method: 'POST',
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
        }
        return
      }

      setSubmitted(true)
    } catch {
      setErrors({ form: 'Something went wrong. Try again.' })
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <section className="px-[60px] pb-32 max-md:px-8">
        <div className="max-w-[600px]">
          <h2 className="font-syne text-3xl font-bold text-tag-text">You&apos;re in the queue.</h2>
          <p className="mt-4 font-grotesk text-lg text-tag-muted">
            We read every application. If the energy fits, we&apos;ll reach out.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="px-[60px] pb-32 max-md:px-8">
      <form onSubmit={handleSubmit} className="max-w-[600px] space-y-8">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className={labelClass}>
            Name
          </Label>
          <Input
            id="name"
            name="name"
            required
            placeholder="Your name"
            className={inputClass}
          />
          {errors.name && (
            <p className="font-mono text-xs text-red-400">{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className={labelClass}>
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className={inputClass}
          />
          {errors.email && (
            <p className="font-mono text-xs text-red-400">{errors.email}</p>
          )}
        </div>

        {/* What are you building? */}
        <div className="space-y-2">
          <Label htmlFor="building" className={labelClass}>
            What are you building?
          </Label>
          <Textarea
            id="building"
            name="building"
            required
            rows={4}
            placeholder="Side projects, startups, experiments..."
            className={inputClass}
          />
          {errors.building && (
            <p className="font-mono text-xs text-red-400">{errors.building}</p>
          )}
        </div>

        {/* Why TAG? */}
        <div className="space-y-2">
          <Label htmlFor="whyTag" className={labelClass}>
            Why TAG?
          </Label>
          <Textarea
            id="whyTag"
            name="whyTag"
            required
            rows={3}
            placeholder="What drew you here?"
            className={inputClass}
          />
          {errors.whyTag && (
            <p className="font-mono text-xs text-red-400">{errors.whyTag}</p>
          )}
        </div>

        {/* How did you hear about us? */}
        <div className="space-y-2">
          <Label htmlFor="referral" className={labelClass}>
            How did you hear about us?
          </Label>
          <Select name="referral">
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

        {/* Socials */}
        <div className="space-y-4">
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
              placeholder="https://instagram.com/you"
              className={inputClass}
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="bg-tag-orange px-8 py-3 font-grotesk font-medium text-tag-bg-deep transition-colors hover:bg-[#e8551b] disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Tag In \u2192'}
        </button>

        {errors.form && (
          <p className="font-mono text-xs text-red-400">{errors.form}</p>
        )}

        <p className="font-mono text-sm text-tag-dim">
          We read every application. If the energy fits, we&apos;ll reach out.
        </p>
      </form>
    </section>
  )
}
