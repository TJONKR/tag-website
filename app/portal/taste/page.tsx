import { PortalHeader } from '@lib/portal/components'
import { getUser } from '@lib/auth/queries'
import { ProfilePageClient } from '@lib/taste/components'

export default async function TastePage() {
  const user = await getUser()

  // Fetch profile data for the prompt component
  const { createServerSupabaseClient } = await import('@lib/db')
  const supabase = await createServerSupabaseClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, twitter_url, linkedin_url, github_url, website_url')
    .eq('id', user.id)
    .single()

  return (
    <>
      <PortalHeader
        title="Profile"
        description="Your AI-enriched builder profile. Control what's shown publicly."
      />
      <ProfilePageClient
        userId={user.id}
        profile={
          profile || {
            name: user.name,
            twitter_url: null,
            linkedin_url: null,
            github_url: null,
            website_url: null,
          }
        }
      />
    </>
  )
}
