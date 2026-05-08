'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'

import { Button } from '@components/ui/button'
import { Textarea } from '@components/ui/textarea'
import { toast } from '@components/toast'

const inputClass =
  'border-tag-border bg-tag-card text-tag-text placeholder:text-tag-dim focus-visible:ring-tag-orange'

interface IdeaFormProps {
  onSubmitted?: () => void
}

export const IdeaForm = ({ onSubmitted }: IdeaFormProps) => {
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!body.trim()) return
    setLoading(true)

    try {
      const res = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body }),
      })

      const json = await res.json()

      if (!res.ok) {
        toast({
          type: 'error',
          description: json.errors?.[0]?.message ?? 'Failed to submit idea.',
        })
        return
      }

      toast({ type: 'success', description: 'Your idea has been submitted.' })
      setBody('')
      onSubmitted?.()
    } catch {
      toast({ type: 'error', description: 'Something went wrong. Try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        name="body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="What's your idea?"
        className={`${inputClass} min-h-[120px]`}
        maxLength={4000}
        required
      />
      <Button
        type="submit"
        disabled={loading || !body.trim()}
        className="gap-2 bg-tag-orange text-tag-bg hover:bg-tag-orange/90 disabled:opacity-50"
      >
        {loading && <Loader2 className="size-4 animate-spin" />}
        Submit idea
      </Button>
    </form>
  )
}
