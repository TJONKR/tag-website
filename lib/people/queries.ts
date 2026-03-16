import { createServiceRoleClient } from '@lib/db'

import type { Member, MemberCounts } from './types'
import type { UserRole } from '@lib/auth/types'

export const getMembers = async (): Promise<Member[]> => {
  const supabase = createServiceRoleClient()

  const { data, error } = await supabase.rpc('get_members')

  if (error) throw new Error(error.message)

  return (data as Member[]) ?? []
}

export const getMemberCounts = async (): Promise<MemberCounts> => {
  const members = await getMembers()

  const counts: MemberCounts = {
    ambassador: 0,
    builder: 0,
    operator: 0,
    total: members.length,
  }

  for (const member of members) {
    const role = member.role as UserRole
    if (role in counts) {
      counts[role]++
    }
  }

  return counts
}
