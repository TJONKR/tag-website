import { createServiceRoleClient } from '@lib/db'

import type { UserRole } from '@lib/auth/types'

export const deleteMember = async (userId: string) => {
  const supabase = createServiceRoleClient()

  const { error } = await supabase.auth.admin.deleteUser(userId)
  if (error) throw new Error(error.message)
}

export const updateMemberRole = async (userId: string, role: UserRole) => {
  const supabase = createServiceRoleClient()

  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)

  if (error) throw new Error(error.message)
}
