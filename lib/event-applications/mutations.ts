import { createServerSupabaseClient, createServiceRoleClient } from '@lib/db'
import {
  sendEventHostRequestApproved,
  sendEventHostRequestNewAdmin,
  sendEventHostRequestReceived,
  sendEventHostRequestRejected,
} from '@lib/email/senders'

import type { EventHostRequestInput } from './schema'
import type { EventApplicationStatus, EventHostApplication } from './types'

interface SubmissionMeta {
  ipHash: string | null
  userAgent: string | null
}

export const insertEventHostApplication = async (
  data: EventHostRequestInput,
  meta: SubmissionMeta
): Promise<{ id: string }> => {
  // Use the service-role client on the public insert path so that RLS does
  // not depend on the request carrying an authenticated session.
  const service = createServiceRoleClient()

  const payload = {
    name: data.name,
    email: data.email,
    phone: data.phone || null,
    organization: data.organization || null,
    event_title: data.eventTitle,
    event_type: data.eventType,
    description: data.description,
    expected_attendees:
      typeof data.expectedAttendees === 'number' ? data.expectedAttendees : null,
    proposed_date: data.proposedDate || null,
    proposed_date_flexible: Boolean(data.proposedDateFlexible),
    duration_hours:
      typeof data.durationHours === 'number' ? data.durationHours : null,
    website_url: data.websiteUrl || null,
    social_url: data.socialUrl || null,
    referral: data.referral || null,
    ip_hash: meta.ipHash,
    user_agent: meta.userAgent,
  }

  const { data: inserted, error } = await service
    .from('event_host_applications')
    .insert(payload)
    .select('id')
    .single()

  if (error || !inserted) {
    throw new Error(error?.message ?? 'Failed to insert event host application')
  }

  // Email side-effects are best-effort and never block success of the insert.
  await sendEventHostRequestReceived({
    to: data.email,
    name: data.name,
    eventTitle: data.eventTitle,
  })

  await sendEventHostRequestNewAdmin({
    id: inserted.id as string,
    applicantName: data.name,
    applicantEmail: data.email,
    eventTitle: data.eventTitle,
    eventType: data.eventType,
    description: data.description,
    expectedAttendees:
      typeof data.expectedAttendees === 'number' ? data.expectedAttendees : null,
    proposedDate: data.proposedDate || null,
    proposedDateFlexible: Boolean(data.proposedDateFlexible),
    organization: data.organization || null,
    websiteUrl: data.websiteUrl || null,
    socialUrl: data.socialUrl || null,
  })

  return { id: inserted.id as string }
}

export const updateEventApplicationStatus = async (
  id: string,
  status: EventApplicationStatus,
  reviewedBy: string,
  adminNotes?: string
): Promise<void> => {
  const supabase = await createServerSupabaseClient()

  const { data: existing, error: fetchError } = await supabase
    .from('event_host_applications')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !existing) {
    throw new Error('Event host application not found')
  }

  const app = existing as EventHostApplication

  const update: Record<string, unknown> = {
    status,
    reviewed_at: new Date().toISOString(),
    reviewed_by: reviewedBy,
  }

  if (typeof adminNotes === 'string') {
    update.admin_notes = adminNotes.length > 0 ? adminNotes : null
  }

  const { error } = await supabase
    .from('event_host_applications')
    .update(update)
    .eq('id', id)

  if (error) throw new Error(error.message)

  if (status === 'approved') {
    await sendEventHostRequestApproved({
      to: app.email,
      name: app.name,
      eventTitle: app.event_title,
      adminNotes: typeof adminNotes === 'string' ? adminNotes : app.admin_notes,
    })
  } else if (status === 'rejected') {
    await sendEventHostRequestRejected({
      to: app.email,
      name: app.name,
      eventTitle: app.event_title,
      adminNotes: typeof adminNotes === 'string' ? adminNotes : app.admin_notes,
    })
  }
}
