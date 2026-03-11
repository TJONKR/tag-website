'use client'

import { useState } from 'react'

import { toast } from '@components/toast'
import { Button } from '@components/ui/button'

export const ManageSubscription = () => {
  const [loading, setLoading] = useState(false)

  const handleManage = async () => {
    setLoading(true)

    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        toast({
          type: 'error',
          description: 'Failed to open billing portal.',
        })
      }
    } catch {
      toast({ type: 'error', description: 'Something went wrong.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleManage}
      disabled={loading}
      className="border-tag-border text-tag-muted hover:text-tag-text"
    >
      {loading ? 'Loading...' : 'Manage Subscription'}
    </Button>
  )
}
