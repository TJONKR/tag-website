import { redirect } from 'next/navigation'

import { getUser } from '@lib/auth/queries'
import { getAllIdeas } from '@lib/ideas/queries'
import { AdminIdeaTable } from '@lib/ideas/components'
import { FadeIn, PortalHeader } from '@lib/portal/components'

export default async function AdminIdeasPage() {
  const user = await getUser()

  if (!user.is_super_admin) {
    redirect('/portal/ideas')
  }

  const ideas = await getAllIdeas()

  return (
    <>
      <FadeIn>
        <PortalHeader title="Ideas — admin" description="Review and manage community ideas." />
      </FadeIn>
      <FadeIn delay={75}>
        <AdminIdeaTable initialIdeas={ideas} />
      </FadeIn>
    </>
  )
}
