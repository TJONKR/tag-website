'use client'

import { useState } from 'react'
import {
  Archive,
  Calendar,
  Check,
  Clock,
  ExternalLink,
  Loader2,
  Mail,
  Phone,
  Users,
  X,
} from 'lucide-react'

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@components/ui/sheet'
import { toast } from '@components/toast'
import { formatDateFull } from '@lib/events/types'

import type {
  EventApplicationStatus,
  EventHostApplication,
} from '../types'

interface EventApplicationDetailSheetProps {
  application: EventHostApplication | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdated: () => void | Promise<void>
}

const statusPillClasses: Record<EventApplicationStatus, string> = {
  pending: 'bg-yellow-500/10 text-yellow-500',
  approved: 'bg-green-500/10 text-green-500',
  rejected: 'bg-red-500/10 text-red-500',
  archived: 'bg-tag-dim/10 text-tag-muted',
}

export const EventApplicationDetailSheet = ({
  application,
  open,
  onOpenChange,
  onUpdated,
}: EventApplicationDetailSheetProps) => {
  const [loadingAction, setLoadingAction] =
    useState<EventApplicationStatus | null>(null)

  const handleAction = async (status: EventApplicationStatus) => {
    if (!application) return
    setLoadingAction(status)

    try {
      const res = await fetch(`/api/event-applications/${application.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
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
      onOpenChange(false)
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="w-full overflow-y-auto border-tag-border bg-tag-bg p-8 text-tag-text sm:max-w-lg sm:p-10 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]"
      >
        {application && (
          <>
            <SheetHeader className="space-y-3 pr-8 text-left">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider ${statusPillClasses[application.status]}`}
                >
                  {application.status}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-tag-dim">
                  {application.event_type}
                </span>
              </div>
              <SheetTitle className="font-syne text-2xl leading-tight text-tag-text">
                {application.event_title}
              </SheetTitle>
              <SheetDescription className="sr-only">
                Event request details
              </SheetDescription>
            </SheetHeader>

            <div className="mt-8 space-y-5 border-y border-tag-border py-6 text-sm">
              {application.proposed_date && (
                <div className="flex items-start gap-4">
                  <Calendar className="mt-0.5 size-4 shrink-0 text-tag-orange" />
                  <span className="text-tag-text">
                    {formatDateFull(application.proposed_date)}
                    {application.proposed_date_flexible && (
                      <span className="ml-2 text-tag-dim">(flexible)</span>
                    )}
                  </span>
                </div>
              )}
              {!application.proposed_date && application.proposed_date_flexible && (
                <div className="flex items-start gap-4">
                  <Calendar className="mt-0.5 size-4 shrink-0 text-tag-orange" />
                  <span className="text-tag-text">Flexible date</span>
                </div>
              )}
              {application.duration_hours !== null && (
                <div className="flex items-start gap-4">
                  <Clock className="mt-0.5 size-4 shrink-0 text-tag-orange" />
                  <span className="text-tag-text">
                    {application.duration_hours}h
                  </span>
                </div>
              )}
              {application.expected_attendees !== null && (
                <div className="flex items-start gap-4">
                  <Users className="mt-0.5 size-4 shrink-0 text-tag-orange" />
                  <span className="text-tag-text">
                    ~{application.expected_attendees} attendees
                    <span className="ml-2 text-tag-dim">(estimated)</span>
                  </span>
                </div>
              )}
              <div className="flex items-start gap-4">
                <Mail className="mt-0.5 size-4 shrink-0 text-tag-orange" />
                <div className="min-w-0">
                  <p className="truncate text-tag-text">
                    {application.name}
                    {application.organization
                      ? ` · ${application.organization}`
                      : ''}
                  </p>
                  <a
                    href={`mailto:${application.email}`}
                    className="truncate font-mono text-xs text-tag-muted hover:text-tag-orange"
                  >
                    {application.email}
                  </a>
                </div>
              </div>
              {application.phone && (
                <div className="flex items-start gap-4">
                  <Phone className="mt-0.5 size-4 shrink-0 text-tag-orange" />
                  <a
                    href={`tel:${application.phone}`}
                    className="font-mono text-xs text-tag-muted hover:text-tag-orange"
                  >
                    {application.phone}
                  </a>
                </div>
              )}
            </div>

            <div className="mt-8">
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-tag-dim">
                Description
              </p>
              <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-tag-muted">
                {application.description}
              </p>
            </div>

            {(application.website_url || application.social_url) && (
              <div className="mt-6 flex flex-wrap gap-3">
                {application.website_url && (
                  <a
                    href={application.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-md border border-tag-orange/30 bg-tag-orange/10 px-3 py-1.5 font-mono text-xs uppercase tracking-[0.14em] text-tag-orange transition-colors hover:bg-tag-orange/20"
                  >
                    <ExternalLink className="size-3.5" />
                    Website
                  </a>
                )}
                {application.social_url && (
                  <a
                    href={application.social_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-md border border-tag-orange/30 bg-tag-orange/10 px-3 py-1.5 font-mono text-xs uppercase tracking-[0.14em] text-tag-orange transition-colors hover:bg-tag-orange/20"
                  >
                    <ExternalLink className="size-3.5" />
                    Social
                  </a>
                )}
              </div>
            )}

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 font-mono text-xs text-tag-dim">
              <span>
                Submitted {new Date(application.created_at).toLocaleDateString()}
              </span>
              {application.reviewed_at && (
                <span>
                  Reviewed{' '}
                  {new Date(application.reviewed_at).toLocaleDateString()}
                </span>
              )}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => handleAction('approved')}
                disabled={loadingAction !== null}
                className="flex items-center gap-2 rounded-md bg-green-600 px-5 py-2.5 font-grotesk font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
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
                className="flex items-center gap-2 rounded-md border border-red-500/30 px-5 py-2.5 font-grotesk font-medium text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50"
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
                className="flex items-center gap-2 rounded-md border border-tag-border px-5 py-2.5 font-grotesk font-medium text-tag-muted transition-colors hover:bg-tag-card disabled:opacity-50"
              >
                {loadingAction === 'archived' ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Archive className="size-4" />
                )}
                Archive
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
