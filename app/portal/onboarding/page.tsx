import { redirect } from 'next/navigation'

import { getUser } from '@lib/auth/queries'
import { createServerSupabaseClient } from '@lib/db'
import { OnboardingForm } from '@lib/onboarding/components'
import { getUserPhotos } from '@lib/photos/queries'

interface OnboardingPageProps {
  searchParams: Promise<{ preview?: string }>
}

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const user = await getUser()
  const { preview } = await searchParams
  const isPreview = preview === 'true' && !!user.is_super_admin

  const supabase = await createServerSupabaseClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', user.id)
    .single()

  if (profile?.onboarding_completed && !isPreview) {
    redirect('/portal/events')
  }

  const userPhotos = await getUserPhotos(user.id)
  const photoUrls: Record<string, string> = {}
  for (const photo of userPhotos) {
    const { data } = await supabase.storage
      .from('user-photos')
      .createSignedUrl(photo.storage_path, 3600)
    if (data?.signedUrl) photoUrls[photo.id] = data.signedUrl
  }

  return (
    <>
      <div className="flex justify-center pb-2 pt-4">
        <span className="font-syne text-2xl font-extrabold tracking-tight text-tag-text">
          TAG
        </span>
      </div>
      <OnboardingForm
        name={user.name}
        avatarUrl={user.avatar_url}
        initialPhotos={userPhotos}
        photoUrls={photoUrls}
        isPreview={isPreview}
      />
    </>
  )
}
