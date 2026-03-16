import { createServiceRoleClient } from '@lib/db'

import type { UserRole } from '@lib/auth/types'

export const updateMemberRole = async (userId: string, role: UserRole) => {
  const supabase = createServiceRoleClient()

  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)

  if (error) throw new Error(error.message)
}
