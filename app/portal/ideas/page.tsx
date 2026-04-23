import Link from 'next/link'

import { getUser } from '@lib/auth/queries'
import { getIdeasByUser } from '@lib/ideas/queries'
import { IdeaList } from '@lib/ideas/components'
import { FadeIn, PortalHeader } from '@lib/portal/components'

export default async function IdeasPage() {
  const user = await getUser()
  const ideas = await getIdeasByUser(user.id)

  return (
    <>
      <FadeIn>
        <PortalHeader
          title="Ideas"
          description="Share ideas for events, features, or the community."
        />
      </FadeIn>
      <FadeIn delay={75}>
        {user.is_super_admin && (
          <div className="mb-6 flex justify-end">
            <Link
              href="/portal/admin/ideas"
              className="font-mono text-xs uppercase tracking-wider text-tag-orange hover:text-tag-orange/80"
            >
              Admin view →
            </Link>
          </div>
        )}
        <IdeaList initialIdeas={ideas} />
      </FadeIn>
    </>
  )
}
