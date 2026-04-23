'use client'

import { useEffect, useRef, useState } from 'react'

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
import { Checkbox } from '@components/ui/checkbox'

const EVENT_TYPE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'talk', label: 'Talk' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'meetup', label: 'Meetup' },
  { value: 'hackathon', label: 'Hackathon' },
  { value: 'launch', label: 'Launch' },
  { value: 'other', label: 'Other' },
]

const REFERRAL_OPTIONS = [
  'Member recommendation',
  'Twitter/X',
  'LinkedIn',
  'Instagram',
  'Google / search',
  'Event at TAG',
  'Other',
]

const labelClass = 'font-mono text-[12px] uppercase tracking-[0.08em] text-tag-muted'

const inputClass =
  'border-tag-border bg-tag-card text-tag-text placeholder:text-tag-dim focus-visible:ring-tag-orange'

export const EventHostForm = () => {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showMore, setShowMore] = useState(false)
  const [flexible, setFlexible] = useState(false)

  // Timestamp captured when the component mounts. Used server-side to
  // reject submissions that happen too fast to be human.
  const formLoadedAtRef = useRef<number>(Date.now())

  useEffect(() => {
    formLoadedAtRef.current = Date.now()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    const formData = new FormData(e.currentTarget)
    const payload = {
      name: (formData.get('name') as string) ?? '',
      email: (formData.get('email') as string) ?? '',
      phone: (formData.get('phone') as string) || '',
      organization: (formData.get('organization') as string) || '',
      eventTitle: (formData.get('eventTitle') as string) ?? '',
      eventType: (formData.get('eventType') as string) ?? '',
      description: (formData.get('description') as string) ?? '',
      expectedAttendees: (formData.get('expectedAttendees') as string) || '',
      proposedDate: (formData.get('proposedDate') as string) || '',
      proposedDateFlexible: flexible,
      durationHours: (formData.get('durationHours') as string) || '',
      websiteUrl: (formData.get('websiteUrl') as string) || '',
      socialUrl: (formData.get('socialUrl') as string) || '',
      referral: (formData.get('referral') as string) || '',
      // Honeypot — should stay empty
      website: (formData.get('website') as string) || '',
      formLoadedAt: formLoadedAtRef.current,
    }

    try {
      const res = await fetch('/api/event-applications/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = await res.json()

      if (!res.ok) {
        if (json.errors) {
          const fieldErrors: Record<string, string> = {}
          for (const err of json.errors) {
            if (err.path?.[0]) {
              fieldErrors[err.path[0]] = err.message
            } else if (err.message) {
              fieldErrors.form = err.message
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
        <div className="mx-auto max-w-[1440px]">
          <div className="max-w-[600px]">
            <h2 className="font-syne text-3xl font-bold text-tag-text">
              Request received.
            </h2>
            <p className="mt-4 font-grotesk text-lg text-tag-muted">
              Thanks — we&apos;ll read every request and get back to you
              personally. Check your inbox for a confirmation.
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="px-[60px] pb-32 max-md:px-8">
      <div className="mx-auto max-w-[1440px]">
        <form onSubmit={handleSubmit} className="max-w-[600px] space-y-8" noValidate>
          {/* Honeypot — visually hidden, but still focusable for accessibility. */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: '-10000px',
              top: 'auto',
              width: '1px',
              height: '1px',
              overflow: 'hidden',
            }}
          >
            <label htmlFor="website">Website</label>
            <input
              id="website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              defaultValue=""
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className={labelClass}>
              Your name
            </Label>
            <Input
              id="name"
              name="name"
              required
              placeholder="Your full name"
              className={inputClass}
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

          <div className="space-y-2">
            <Label htmlFor="eventTitle" className={labelClass}>
              Event title
            </Label>
            <Input
              id="eventTitle"
              name="eventTitle"
              required
              placeholder="What's it called?"
              className={inputClass}
            />
            {errors.eventTitle && (
              <p className="font-mono text-xs text-red-400">{errors.eventTitle}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="eventType" className={labelClass}>
              Event type
            </Label>
            <Select name="eventType" required>
              <SelectTrigger className={inputClass}>
                <SelectValue placeholder="Pick one" />
              </SelectTrigger>
              <SelectContent className="border-tag-border bg-tag-card">
                {EVENT_TYPE_OPTIONS.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="text-tag-text focus:bg-tag-border focus:text-tag-text"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.eventType && (
              <p className="font-mono text-xs text-red-400">{errors.eventType}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className={labelClass}>
              What&apos;s the event about? (30+ chars)
            </Label>
            <Textarea
              id="description"
              name="description"
              required
              rows={5}
              placeholder="Topic, format, who should come, why TAG..."
              className={inputClass}
              minLength={30}
            />
            {errors.description && (
              <p className="font-mono text-xs text-red-400">{errors.description}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="expectedAttendees" className={labelClass}>
              Expected attendees
            </Label>
            <Input
              id="expectedAttendees"
              name="expectedAttendees"
              type="number"
              min={1}
              max={200}
              placeholder="e.g. 40"
              className={inputClass}
            />
            {errors.expectedAttendees && (
              <p className="font-mono text-xs text-red-400">
                {errors.expectedAttendees}
              </p>
            )}
          </div>

          {/* More details toggle */}
          <div>
            <button
              type="button"
              onClick={() => setShowMore((v) => !v)}
              className="font-mono text-xs uppercase tracking-[0.08em] text-tag-orange hover:underline"
            >
              {showMore ? '− Hide extra details' : '+ More details (optional)'}
            </button>
          </div>

          {showMore && (
            <div className="space-y-8 border-l border-tag-border pl-6">
              <div className="space-y-2">
                <Label htmlFor="organization" className={labelClass}>
                  Organization / company
                </Label>
                <Input
                  id="organization"
                  name="organization"
                  placeholder="Optional"
                  className={inputClass}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className={labelClass}>
                  Phone
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Optional"
                  className={inputClass}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="proposedDate" className={labelClass}>
                  Proposed date
                </Label>
                <Input
                  id="proposedDate"
                  name="proposedDate"
                  type="date"
                  className={inputClass}
                />
                <div className="flex items-center gap-2 pt-2">
                  <Checkbox
                    id="proposedDateFlexible"
                    checked={flexible}
                    onCheckedChange={(v) => setFlexible(Boolean(v))}
                  />
                  <Label
                    htmlFor="proposedDateFlexible"
                    className="font-mono text-xs text-tag-muted"
                  >
                    Flexible — we can work with what fits TAG&apos;s calendar
                  </Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="durationHours" className={labelClass}>
                  Duration (hours)
                </Label>
                <Input
                  id="durationHours"
                  name="durationHours"
                  type="number"
                  min={0.5}
                  max={12}
                  step={0.5}
                  placeholder="e.g. 2"
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
                  placeholder="https://..."
                  className={inputClass}
                />
                {errors.websiteUrl && (
                  <p className="font-mono text-xs text-red-400">{errors.websiteUrl}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="socialUrl" className={labelClass}>
                  Social link
                </Label>
                <Input
                  id="socialUrl"
                  name="socialUrl"
                  type="url"
                  placeholder="https://x.com/you or LinkedIn, Instagram..."
                  className={inputClass}
                />
                {errors.socialUrl && (
                  <p className="font-mono text-xs text-red-400">{errors.socialUrl}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="referral" className={labelClass}>
                  How did you hear about TAG?
                </Label>
                <Select name="referral">
                  <SelectTrigger className={inputClass}>
                    <SelectValue placeholder="Select (optional)" />
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

          <button
            type="submit"
            disabled={loading}
            className="bg-tag-orange px-8 py-3 font-grotesk font-medium text-tag-bg-deep transition-colors hover:bg-[#e8551b] disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send request \u2192'}
          </button>

          {errors.form && (
            <p className="font-mono text-xs text-red-400">{errors.form}</p>
          )}

          <p className="font-mono text-sm text-tag-dim">
            We reply to every request, usually within a few days.
          </p>
        </form>
      </div>
    </section>
  )
}
