'use client'

import { useState } from 'react'
import { Send, Loader2 } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@components/ui/dialog'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'
import { toast } from '@components/toast'

const labelClass = 'font-mono text-[12px] uppercase tracking-[0.08em] text-tag-muted'
const inputClass =
  'border-tag-border bg-tag-card text-tag-text placeholder:text-tag-dim focus-visible:ring-tag-orange'

export const InviteDialog = () => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const name = (formData.get('name') as string) || undefined

    try {
      const res = await fetch('/api/applications/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.errors?.[0]?.message || 'Failed to send invite')
      }

      toast({ type: 'success', description: `Invite sent to ${email}` })
      setOpen(false)
    } catch (error) {
      toast({
        type: 'error',
        description: error instanceof Error ? error.message : 'Something went wrong.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 bg-tag-orange px-6 py-2.5 font-grotesk font-medium text-tag-bg-deep transition-colors hover:bg-[#e8551b]">
          <Send className="size-4" />
          Direct Invite
        </button>
      </DialogTrigger>
      <DialogContent className="border-tag-border bg-tag-bg text-tag-text">
        <DialogHeader>
          <DialogTitle className="font-syne text-xl">
            Invite a Builder
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="invite-email" className={labelClass}>
              Email
            </Label>
            <Input
              id="invite-email"
              name="email"
              type="email"
              required
              placeholder="builder@example.com"
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invite-name" className={labelClass}>
              Name (optional)
            </Label>
            <Input
              id="invite-name"
              name="name"
              placeholder="Their name"
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 bg-tag-orange px-8 py-3 font-grotesk font-medium text-tag-bg-deep transition-colors hover:bg-[#e8551b] disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="size-4" />
                Send Invite
              </>
            )}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
