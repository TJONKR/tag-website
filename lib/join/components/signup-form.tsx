'use client'

import { useState } from 'react'
import { ArrowLeft, ArrowRight, Loader2, Mail } from 'lucide-react'

import { toast } from '@components/toast'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'
import { Textarea } from '@components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select'
import { register } from '@lib/auth/actions'
import { cn } from '@lib/utils'

import type { RegisterActionState } from '@lib/auth/types'

const TOTAL_STEPS = 3
const REFERRAL_OPTIONS = ['Twitter/X', 'LinkedIn', 'Friend', 'Event', 'Other']

const labelClass =
  'font-mono text-[12px] uppercase tracking-[0.08em] text-tag-muted'
const inputClass =
  'border-tag-border bg-tag-card text-tag-text placeholder:text-tag-dim focus-visible:ring-tag-orange'

interface FormData {
  // Step 1
  name: string
  email: string
  password: string
  // Step 2
  building: string
  whyTag: string
  referral: string
  // Step 3
  linkedinUrl: string
  twitterUrl: string
  githubUrl: string
  websiteUrl: string
  instagramUrl: string
}

const INITIAL_DATA: FormData = {
  name: '',
  email: '',
  password: '',
  building: '',
  whyTag: '',
  referral: '',
  linkedinUrl: '',
  twitterUrl: '',
  githubUrl: '',
  websiteUrl: '',
  instagramUrl: '',
}

export const SignupForm = () => {
  const [step, setStep] = useState(1)
  const [data, setData] = useState<FormData>(INITIAL_DATA)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const update = (field: keyof FormData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const validateStep = (s: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (s === 1) {
      if (!data.name.trim()) newErrors.name = 'Name is required'
      if (!data.email.trim()) newErrors.email = 'Email is required'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
        newErrors.email = 'Valid email is required'
      if (!data.password) newErrors.password = 'Password is required'
      else if (data.password.length < 6)
        newErrors.password = 'At least 6 characters'
    }

    if (s === 2) {
      if (!data.building.trim())
        newErrors.building = 'Tell us what you are building'
      if (!data.whyTag.trim()) newErrors.whyTag = 'Tell us why TAG'
    }

    // Step 3 is all optional — no validation needed

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const goNext = () => {
    if (validateStep(step)) {
      setStep((s) => Math.min(s + 1, TOTAL_STEPS))
    }
  }

  const goBack = () => {
    setStep((s) => Math.max(s - 1, 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(step)) return

    setLoading(true)
    const fd = new window.FormData()
    Object.entries(data).forEach(([key, val]) => fd.append(key, val))

    const result: RegisterActionState = await register({ status: 'idle' }, fd)

    if (result.status === 'success') {
      setSuccess(true)
    } else if (result.status === 'invalid_data') {
      toast({
        type: 'error',
        description: 'Please check your details and try again.',
      })
    } else {
      toast({
        type: 'error',
        description: 'Something went wrong. Please try again.',
      })
    }

    setLoading(false)
  }

  if (success) {
    return (
      <section className="px-[60px] pb-32 max-md:px-8">
        <div className="max-w-[600px] space-y-6">
          <div className="flex size-16 items-center justify-center rounded-full bg-tag-orange/10">
            <Mail className="size-8 text-tag-orange" />
          </div>
          <h2 className="font-syne text-3xl font-bold text-tag-text">
            Check your email
          </h2>
          <p className="font-grotesk text-lg text-tag-muted">
            We sent a confirmation link to{' '}
            <span className="text-tag-text">{data.email}</span>. Click it to
            activate your account and head straight to your portal.
          </p>
          <p className="font-mono text-sm text-tag-dim">
            Didn&apos;t get it? Check your spam folder or{' '}
            <a
              href="/join"
              className="text-tag-orange transition-colors hover:text-[#e8551b]"
            >
              try again
            </a>
            .
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="px-[60px] pb-32 max-md:px-8">
      <div className="max-w-[600px]">
        {/* Step indicator */}
        <div className="mb-10 flex items-center gap-3">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((s) => (
            <div key={s} className="flex items-center gap-3">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full font-mono text-sm transition-colors',
                  s === step
                    ? 'bg-tag-orange text-tag-bg-deep'
                    : s < step
                      ? 'bg-tag-orange/20 text-tag-orange'
                      : 'bg-tag-border text-tag-dim'
                )}
              >
                {s}
              </div>
              {s < TOTAL_STEPS && (
                <div
                  className={cn(
                    'h-px w-8 transition-colors',
                    s < step ? 'bg-tag-orange/40' : 'bg-tag-border'
                  )}
                />
              )}
            </div>
          ))}
          <span className="ml-2 font-mono text-xs text-tag-dim">
            {step === 1 && 'Account'}
            {step === 2 && 'About you'}
            {step === 3 && 'Socials'}
          </span>
        </div>

        {/* Step 1: Account */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className={labelClass}>
                Name
              </Label>
              <Input
                id="name"
                value={data.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="Your name"
                className={inputClass}
                autoFocus
              />
              {errors.name && (
                <p className="font-mono text-xs text-red-400">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className={labelClass}>
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={data.email}
                onChange={(e) => update('email', e.target.value)}
                placeholder="you@example.com"
                className={inputClass}
              />
              {errors.email && (
                <p className="font-mono text-xs text-red-400">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className={labelClass}>
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={data.password}
                onChange={(e) => update('password', e.target.value)}
                placeholder="At least 6 characters"
                className={inputClass}
              />
              {errors.password && (
                <p className="font-mono text-xs text-red-400">
                  {errors.password}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 2: About you */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="building" className={labelClass}>
                What are you building?
              </Label>
              <Textarea
                id="building"
                value={data.building}
                onChange={(e) => update('building', e.target.value)}
                rows={4}
                placeholder="Side projects, startups, experiments..."
                className={inputClass}
              />
              {errors.building && (
                <p className="font-mono text-xs text-red-400">
                  {errors.building}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="whyTag" className={labelClass}>
                Why TAG?
              </Label>
              <Textarea
                id="whyTag"
                value={data.whyTag}
                onChange={(e) => update('whyTag', e.target.value)}
                rows={3}
                placeholder="What drew you here?"
                className={inputClass}
              />
              {errors.whyTag && (
                <p className="font-mono text-xs text-red-400">
                  {errors.whyTag}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="referral" className={labelClass}>
                How did you hear about us?
              </Label>
              <Select
                value={data.referral}
                onValueChange={(val) => update('referral', val)}
              >
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
        )}

        {/* Step 3: Socials */}
        {step === 3 && (
          <div className="space-y-6">
            <p className="font-grotesk text-sm text-tag-muted">
              Add your socials so other builders can find you. All optional.
            </p>

            <div className="space-y-2">
              <Label htmlFor="linkedinUrl" className={labelClass}>
                LinkedIn
              </Label>
              <Input
                id="linkedinUrl"
                type="url"
                value={data.linkedinUrl}
                onChange={(e) => update('linkedinUrl', e.target.value)}
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
                type="url"
                value={data.twitterUrl}
                onChange={(e) => update('twitterUrl', e.target.value)}
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
                type="url"
                value={data.githubUrl}
                onChange={(e) => update('githubUrl', e.target.value)}
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
                type="url"
                value={data.websiteUrl}
                onChange={(e) => update('websiteUrl', e.target.value)}
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
                type="url"
                value={data.instagramUrl}
                onChange={(e) => update('instagramUrl', e.target.value)}
                placeholder="https://instagram.com/you"
                className={inputClass}
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-10 flex items-center gap-4">
          {step > 1 && (
            <button
              type="button"
              onClick={goBack}
              className="flex items-center gap-2 font-grotesk text-sm text-tag-muted transition-colors hover:text-tag-text"
            >
              <ArrowLeft className="size-4" />
              Back
            </button>
          )}

          {step < TOTAL_STEPS ? (
            <button
              type="button"
              onClick={goNext}
              className="ml-auto flex items-center gap-2 bg-tag-orange px-8 py-3 font-grotesk font-medium text-tag-bg-deep transition-colors hover:bg-[#e8551b]"
            >
              Continue
              <ArrowRight className="size-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="ml-auto flex items-center gap-2 bg-tag-orange px-8 py-3 font-grotesk font-medium text-tag-bg-deep transition-colors hover:bg-[#e8551b] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Tag In \u2192'
              )}
            </button>
          )}
        </div>

        <p className="mt-8 font-mono text-sm text-tag-dim">
          Already have an account?{' '}
          <a
            href="/login"
            className="text-tag-orange transition-colors hover:text-[#e8551b]"
          >
            Sign in
          </a>
        </p>
      </div>
    </section>
  )
}
