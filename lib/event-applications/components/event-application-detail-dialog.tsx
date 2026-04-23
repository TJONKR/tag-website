'use client'

import { useEffect, useState } from 'react'
import { Archive, Check, Loader2, Mail, X } from 'lucide-react'

import { Badge } from '@components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog'
import { Textarea } from '@components/ui/textarea'
import { toast } from '@components/toast'

import type {
  EventApplicationStatus,
  EventHostApplication,
} from '../types'

interface EventApplicationDetailDialogProps {
  application: EventHostApplication | null
  onClose: () => void
  onUpdated: () => void | Promise<void>
}

const statusColors: Record<EventApplicationStatus, string> = {
  pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  approved: 'bg-green-500/10 text-green-500 border-green-500/20',
  rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
  archived: 'bg-tag-border/40 text-tag-dim border-tag-border',
}

export const EventApplicationDetailDialog = ({
  application,
  onClose,
  onUpdated,
}: EventApplicationDetailDialogProps) => {
  const [notes, setNotes] = useState('')
  const [loadingAction, setLoadingAction] = useState<EventApplicationStatus | null>(
    null
  )

  useEffect(() => {
    setNotes(application?.admin_notes ?? '')
    setLoadingAction(null)
  }, [application?.id, application?.admin_notes])

  const handleAction = async (status: EventApplicationStatus) => {
    if (!application) return
    setLoadingAction(status)

    try {
      const res = await fetch(`/api/event-applications/${application.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminNotes: notes }),
      })

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.errors?.[0]?.message ?? 'Failed')
      }

      toast({
        type: 'success',
        description:
          status === 'approved'
            ? 'Request approved — email sent to host.'
            : status === 'rejected'
              ? 'Request rejected — email sent to host.'
              : status === 'archived'
                ? 'Request archived.'
                : 'Request updated.',
      })

      await onUpdated()
      onClose()
    } catch (error) {
      toast({
        type: 'error',
        description:
          error instanceof Error ? error.message : 'Something went wrong.',
      })
    } finally {
      setLoadingAction(null)
    }
  }

  return (
    <Dialog open={!!application} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto border-tag-border bg-tag-bg text-tag-text sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle className="font-syne text-xl">
            {application?.event_title}
          </DialogTitle>
        </DialogHeader>

        {application && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline" className={statusColors[application.status]}>
                {application.status}
              </Badge>
              <Badge
                variant="outline"
                className="border-tag-border text-tag-muted"
              >
                {application.event_type}
              </Badge>
              <span className="font-mono text-xs text-tag-dim">
                Submitted {new Date(application.created_at).toLocaleDateString()}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-tag-dim">
                  From
                </p>
                <p className="mt-1 font-grotesk text-sm text-tag-text">
                  {application.name}
                  {application.organization ? ` · ${application.organization}` : ''}
                </p>
                <p className="mt-1 flex items-center gap-2 font-mono text-xs text-tag-muted">
                  <Mail className="size-3" />
                  <a
                    href={`mailto:${application.email}`}
                    className="hover:text-tag-orange"
                  >
                    {application.email}
                  </a>
                </p>
                {application.phone && (
                  <p className="mt-1 font-mono text-xs text-tag-muted">
                    {application.phone}
                  </p>
                )}
              </div>

              <div>
                <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-tag-dim">
                  Description
                </p>
                <p className="mt-1 whitespace-pre-wrap font-grotesk text-sm text-tag-text">
                  {application.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {application.expected_attendees !== null && (
                  <div>
                    <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-tag-dim">
                      Expected attendees
                    </p>
                    <p className="mt-1 font-grotesk text-sm text-tag-text">
                      {application.expected_attendees}
                    </p>
                  </div>
                )}

                {(application.proposed_date || application.proposed_date_flexible) && (
                  <div>
                    <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-tag-dim">
                      Proposed date
                    </p>
                    <p className="mt-1 font-grotesk text-sm text-tag-text">
                      {application.proposed_date ?? 'Flexible'}
                      {application.proposed_date && application.proposed_date_flexible
                        ? ' (flexible)'
                        : ''}
                    </p>
                  </div>
                )}

                {application.duration_hours !== null && (
                  <div>
                    <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-tag-dim">
                      Duration
                    </p>
                    <p className="mt-1 font-grotesk text-sm text-tag-text">
                      {application.duration_hours}h
                    </p>
                  </div>
                )}

                {application.referral && (
                  <div>
                    <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-tag-dim">
                      Referral
                    </p>
                    <p className="mt-1 font-grotesk text-sm text-tag-text">
                      {application.referral}
                    </p>
                  </div>
                )}
              </div>

              {(application.website_url || application.social_url) && (
                <div className="flex flex-wrap gap-3">
                  {application.website_url && (
                    <a
                      href={application.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs text-tag-orange hover:underline"
                    >
                      Website
                    </a>
                  )}
                  {application.social_url && (
                    <a
                      href={application.social_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs text-tag-orange hover:underline"
                    >
                      Social
                    </a>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-tag-dim">
                Admin notes (shared with host on approve/reject)
              </p>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Notes to include in the response email..."
                className="border-tag-border bg-tag-card text-tag-text"
              />
            </div>

            {application.reviewed_at && (
              <p className="font-mono text-xs text-tag-dim">
                Reviewed {new Date(application.reviewed_at).toLocaleDateString()}
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleAction('approved')}
                disabled={loadingAction !== null}
                className="flex items-center gap-2 bg-green-600 px-6 py-2.5 font-grotesk font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
              >
                {loadingAction === 'approved' ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Check className="size-4" />
                )}
                Approve
              </button>
              <button
                onClick={() => handleAction('rejected')}
                disabled={loadingAction !== null}
                className="flex items-center gap-2 border border-red-500/30 px-6 py-2.5 font-grotesk font-medium text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50"
              >
                {loadingAction === 'rejected' ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <X className="size-4" />
                )}
                Reject
              </button>
              <button
                onClick={() => handleAction('archived')}
                disabled={loadingAction !== null}
                className="flex items-center gap-2 border border-tag-border px-6 py-2.5 font-grotesk font-medium text-tag-muted transition-colors hover:bg-tag-card disabled:opacity-50"
              >
                {loadingAction === 'archived' ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Archive className="size-4" />
                )}
                Archive
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
