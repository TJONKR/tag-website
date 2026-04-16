import { createServerSupabaseClient, createServiceRoleClient } from '@lib/db'
import { sendApplicationApproved, sendApplicationRejected } from '@lib/email/senders'

import type { ApplicationStatus } from './types'

export const updateApplicationStatus = async (
  id: string,
  status: ApplicationStatus,
  reviewedBy: string
) => {
  const supabase = await createServerSupabaseClient()

  const { data: application, error: fetchError } = await supabase
    .from('applications')
    .select('email, name')
    .eq('id', id)
    .single()

  if (fetchError || !application) {
    throw new Error('Application not found')
  }

  const { error } = await supabase
    .from('applications')
    .update({
      status,
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewedBy,
    })
    .eq('id', id)

  if (error) throw new Error(error.message)

  if (status === 'rejected') {
    await sendApplicationRejected({ to: application.email, name: application.name })
  }
}

export const acceptApplication = async (id: string, reviewedBy: string) => {
  await updateApplicationStatus(id, 'accepted', reviewedBy)

  const supabase = await createServerSupabaseClient()
  const { data: application, error } = await supabase
    .from('applications')
    .select('email, name')
    .eq('id', id)
    .single()

  if (error || !application) {
    throw new Error('Application not found')
  }

  await sendApplicationApproved({ to: application.email, name: application.name })
}

export const resendApprovalEmail = async (id: string) => {
  const supabase = await createServerSupabaseClient()
  const { data: application, error } = await supabase
    .from('applications')
    .select('email, name, status')
    .eq('id', id)
    .single()

  if (error || !application) {
    throw new Error('Application not found')
  }

  if (application.status !== 'accepted') {
    throw new Error('Application is not accepted')
  }

  await sendApplicationApproved({ to: application.email, name: application.name })
}

// Operator path: pre-approve someone who didn't go through /join. Inserts an
// applications row marked accepted so the user can self-serve at /signup.
export const directInviteApplication = async (
  email: string,
  reviewedBy: string,
  name?: string
) => {
  const serviceClient = createServiceRoleClient()

  const { error: insertError } = await serviceClient.from('applications').insert({
    email,
    name: name ?? email,
    building: '(direct invite)',
    why_tag: '(direct invite)',
    status: 'accepted',
    reviewed_at: new Date().toISOString(),
    reviewed_by: reviewedBy,
  })

  if (insertError) throw new Error(insertError.message)

  await sendApplicationApproved({ to: email, name: name ?? email })
}
