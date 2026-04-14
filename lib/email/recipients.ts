import { createServiceRoleClient } from '@lib/db'

import { adminRecipients } from './config'

/**
 * Returns email addresses that should receive admin notifications.
 * Queries super admin profiles and resolves their emails via auth.users;
 * falls back to the EMAIL_ADMIN_RECIPIENTS env var when unavailable.
 */
export const getAdminRecipients = async (): Promise<string[]> => {
  try {
    const client = createServiceRoleClient()
    const { data: admins, error } = await client
      .from('profiles')
      .select('id')
      .eq('is_super_admin', true)

    if (error || !admins || admins.length === 0) {
      return adminRecipients()
    }

    const emails: string[] = []
    for (const admin of admins) {
      const { data: userData } = await client.auth.admin.getUserById(admin.id)
      const email = userData?.user?.email
      if (email) emails.push(email)
    }

    return emails.length > 0 ? emails : adminRecipients()
  } catch {
    return adminRecipients()
  }
}

/**
 * Fetches a user's email by profile id, using the auth admin API.
 * Returns null if not found or the admin API is unavailable.
 */
export const getUserEmail = async (userId: string): Promise<string | null> => {
  try {
    const client = createServiceRoleClient()
    const { data } = await client.auth.admin.getUserById(userId)
    return data?.user?.email ?? null
  } catch {
    return null
  }
}
