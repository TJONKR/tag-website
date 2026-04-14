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

export const acceptApplication = async (
  id: string,
  reviewedBy: string
) => {
  // Update status
  await updateApplicationStatus(id, 'accepted', reviewedBy)

  // Get the application to find the email
  const supabase = await createServerSupabaseClient()
  const { data: application, error } = await supabase
    .from('applications')
    .select('email, name')
    .eq('id', id)
    .single()

  if (error || !application) {
    throw new Error('Application not found')
  }

  // Send invite via Supabase Auth admin
  const serviceClient = createServiceRoleClient()

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  const { error: inviteError } = await serviceClient.auth.admin.inviteUserByEmail(
    application.email,
    {
      data: {
        name: application.name,
        application_id: id,
      },
      redirectTo: `${siteUrl}/auth/callback?next=/portal/onboarding`,
    }
  )

  if (inviteError) throw new Error(inviteError.message)

  // Custom welcome email sent alongside the Supabase magic-link invite.
  await sendApplicationApproved({ to: application.email, name: application.name })
}

export const inviteUserByEmail = async (
  email: string,
  name?: string
) => {
  const serviceClient = createServiceRoleClient()

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  const { error } = await serviceClient.auth.admin.inviteUserByEmail(
    email,
    {
      data: {
        ...(name ? { name } : {}),
      },
      redirectTo: `${siteUrl}/auth/callback?next=/portal/onboarding`,
    }
  )

  if (error) throw new Error(error.message)
}
