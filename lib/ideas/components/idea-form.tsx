'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'

import { Button } from '@components/ui/button'
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

import type { IdeaCategory } from '../types'

const labelClass = 'font-mono text-[12px] uppercase tracking-[0.08em] text-tag-muted'

const inputClass =
  'border-tag-border bg-tag-card text-tag-text placeholder:text-tag-dim focus-visible:ring-tag-orange'

const CATEGORY_OPTIONS: { value: IdeaCategory; label: string }[] = [
  { value: 'event', label: 'Event' },
  { value: 'feature', label: 'Feature' },
  { value: 'community', label: 'Community' },
  { value: 'other', label: 'Other' },
]

interface IdeaFormProps {
  onSubmitted?: () => void
}

export const IdeaForm = ({ onSubmitted }: IdeaFormProps) => {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [category, setCategory] = useState<IdeaCategory>('feature')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      const res = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body, category }),
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
        toast({
          type: 'error',
          description: json.errors?.[0]?.message ?? 'Failed to submit idea.',
        })
        return
      }

      toast({ type: 'success', description: 'Your idea has been submitted.' })
      setTitle('')
      setBody('')
      setCategory('feature')
      onSubmitted?.()
    } catch {
      toast({ type: 'error', description: 'Something went wrong. Try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="idea-title" className={labelClass}>
          Title
        </Label>
        <Input
          id="idea-title"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Short and clear — what's the idea?"
          className={inputClass}
          maxLength={120}
          required
        />
        {errors.title && <p className="font-mono text-xs text-destructive">{errors.title}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="idea-category" className={labelClass}>
          Category
        </Label>
        <Select value={category} onValueChange={(v) => setCategory(v as IdeaCategory)}>
          <SelectTrigger id="idea-category" className={inputClass}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-tag-border bg-tag-bg">
            {CATEGORY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="idea-body" className={labelClass}>
          Description
        </Label>
        <Textarea
          id="idea-body"
          name="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Walk us through the idea. Context helps."
          className={`${inputClass} min-h-[140px]`}
          maxLength={4000}
          required
        />
        {errors.body && <p className="font-mono text-xs text-destructive">{errors.body}</p>}
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="gap-2 bg-tag-orange text-tag-bg hover:bg-tag-orange/90"
      >
        {loading && <Loader2 className="size-4 animate-spin" />}
        Submit idea
      </Button>
    </form>
  )
}
