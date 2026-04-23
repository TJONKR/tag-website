'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, RefreshCw } from 'lucide-react'

import { cn } from '@lib/utils'
import { toast } from '@components/toast'
import { EventFormDialog } from './event-form-dialog'

export const EventAdminActions = () => {
  const router = useRouter()
  const [syncing, setSyncing] = useState(false)

  const handleLumaSync = async () => {
    setSyncing(true)
    try {
      const res = await fetch('/api/luma/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'all' }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      toast({
        type: 'success',
        description: `Synced ${data.eventsSynced ?? 0} events, ${data.guestsSynced ?? 0} guests`,
      })
      router.refresh()
    } catch {
      toast({ type: 'error', description: 'Luma sync failed' })
    }
    setSyncing(false)
  }

  return (
    <>
      <button
        onClick={handleLumaSync}
        disabled={syncing}
        className="flex items-center gap-1.5 rounded-md border border-tag-border px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-tag-muted transition-colors hover:border-tag-orange/30 hover:text-tag-orange disabled:opacity-50"
      >
        <RefreshCw className={cn('size-3', syncing && 'animate-spin')} />
        {syncing ? 'Syncing...' : 'Sync Luma'}
      </button>
      <EventFormDialog
        isAdmin
        trigger={
          <button className="flex items-center gap-1.5 rounded-md border border-tag-orange/30 bg-tag-orange/10 px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-tag-orange transition-colors hover:bg-tag-orange/20">
            <Plus className="size-3" />
            Add Event
          </button>
        }
      />
    </>
  )
}
