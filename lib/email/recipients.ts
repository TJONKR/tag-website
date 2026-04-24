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
 * Returns the operator team's emails — members with role 'operator' or
 * the is_super_admin flag. Used for operational notifications that should
 * reach the people running TAG day-to-day, not only the super admin.
 */
export const getOperatorRecipients = async (): Promise<string[]> => {
  try {
    const client = createServiceRoleClient()
    const { data: profiles, error } = await client
      .from('profiles')
      .select('id')
      .or('role.eq.operator,is_super_admin.eq.true')

    if (error || !profiles || profiles.length === 0) {
      return adminRecipients()
    }

    const emails: string[] = []
    for (const p of profiles) {
      const { data: userData } = await client.auth.admin.getUserById(p.id)
      const email = userData?.user?.email
      if (email) emails.push(email)
    }

    return emails.length > 0 ? Array.from(new Set(emails)) : adminRecipients()
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
