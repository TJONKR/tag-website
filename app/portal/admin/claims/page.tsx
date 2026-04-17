import { redirect } from 'next/navigation'

import { getUser } from '@lib/auth/queries'

export default async function AdminClaimsPage() {
  const user = await getUser()

  if (!user.is_super_admin) {
    redirect('/portal')
  }

  redirect('/portal/people?tab=claims')
}
