'use client'

import { Check, Loader2, Mail, Undo2, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import { Badge } from '@components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs'
import { toast } from '@components/toast'

import type { AiAmClaimStatus, AiAmClaimWithUser } from '../types'

const statusColors: Record<AiAmClaimStatus, string> = {
  pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  approved: 'bg-green-500/10 text-green-500 border-green-500/20',
  rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
  revoked: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
}

interface ClaimListProps {
  initialClaims: AiAmClaimWithUser[]
}

export const ClaimList = ({ initialClaims }: ClaimListProps) => {
  const [activeTab, setActiveTab] = useState<AiAmClaimStatus>('pending')
  const [claims, setClaims] = useState<AiAmClaimWithUser[]>(initialClaims)
  const [loading, setLoading] = useState<string | null>(null)

  const fetchClaims = useCallback(async (status: AiAmClaimStatus) => {
    try {
      const res = await fetch(`/api/admin/claims?status=${status}`)
      if (res.ok) setClaims(await res.json())
    } catch {
      // Silently fail
    }
  }, [])

  useEffect(() => {
    fetchClaims(activeTab)
  }, [activeTab, fetchClaims])

  const handleAction = async (
    id: string,
    status: 'approved' | 'rejected' | 'revoked'
  ) => {
    setLoading(id)
    try {
      const res = await fetch(`/api/admin/claims/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.errors?.[0]?.message ?? 'Failed')
      }

      toast({
        type: 'success',
        description:
          status === 'approved'
            ? 'Claim approved — user is now a Builder.'
            : status === 'rejected'
              ? 'Claim rejected.'
              : 'Claim revoked — user demoted to Ambassador.',
      })

      await fetchClaims(activeTab)
    } catch (error) {
      toast({
        type: 'error',
        description:
          error instanceof Error ? error.message : 'Something went wrong.',
      })
    } finally {
      setLoading(null)
    }
  }

  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) => setActiveTab(v as AiAmClaimStatus)}
    >
      <TabsList className="border-tag-border bg-tag-card">
        {(['pending', 'approved', 'rejected', 'revoked'] as const).map((s) => (
          <TabsTrigger
            key={s}
            value={s}
            className="data-[state=active]:bg-tag-orange data-[state=active]:text-tag-bg-deep"
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </TabsTrigger>
        ))}
      </TabsList>

      {(['pending', 'approved', 'rejected', 'revoked'] as const).map((status) => (
        <TabsContent key={status} value={status} className="mt-6">
          {claims.length === 0 ? (
            <p className="py-12 text-center font-mono text-sm text-tag-dim">
              No {status} claims.
            </p>
          ) : (
            <div className="space-y-3">
              {claims.map((claim) => (
                <div
                  key={claim.id}
                  className="flex flex-col gap-3 rounded-lg border border-tag-border bg-tag-card p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-grotesk font-medium text-tag-text">
                        {claim.user.name ?? '(no name)'}
                      </span>
                      <Badge
                        variant="outline"
                        className={statusColors[claim.status]}
                      >
                        {claim.status}
                      </Badge>
                    </div>
                    <div className="mt-1 flex items-center gap-2 font-mono text-xs text-tag-dim">
                      <Mail className="size-3" />
                      {claim.user.email ?? '(no email)'}
                    </div>
                    <p className="mt-1 font-mono text-xs text-tag-dim">
                      Submitted{' '}
                      {new Date(claim.submitted_at).toLocaleDateString('en-GB')}
                      {claim.reviewed_at && (
                        <>
                          {' · Reviewed '}
                          {new Date(claim.reviewed_at).toLocaleDateString('en-GB')}
                        </>
                      )}
                    </p>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    {claim.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleAction(claim.id, 'approved')}
                          disabled={loading === claim.id}
                          className="flex items-center gap-2 bg-green-600 px-4 py-2 font-grotesk text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                        >
                          {loading === claim.id ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Check className="size-4" />
                          )}
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(claim.id, 'rejected')}
                          disabled={loading === claim.id}
                          className="flex items-center gap-2 border border-red-500/30 px-4 py-2 font-grotesk text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50"
                        >
                          <X className="size-4" />
                          Reject
                        </button>
                      </>
                    )}
                    {claim.status === 'approved' && (
                      <button
                        onClick={() => handleAction(claim.id, 'revoked')}
                        disabled={loading === claim.id}
                        className="flex items-center gap-2 border border-tag-border px-4 py-2 font-grotesk text-sm font-medium text-tag-muted transition-colors hover:bg-tag-card disabled:opacity-50"
                      >
                        {loading === claim.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Undo2 className="size-4" />
                        )}
                        Revoke
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      ))}
    </Tabs>
  )
}
