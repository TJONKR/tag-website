import { getUser } from '@lib/auth/queries'
import { getUserPhotos } from '@lib/photos/queries'
import { createServerSupabaseClient } from '@lib/db'
import { PortalHeader } from '@lib/portal/components'
import { AvatarWizard } from '@lib/avatar/components/avatar-wizard'

export default async function AvatarPage() {
  const user = await getUser()
  const userPhotos = await getUserPhotos(user.id)

  // Get signed URLs for photos
  const supabase = await createServerSupabaseClient()
  const photoUrls: Record<string, string> = {}
  for (const photo of userPhotos) {
    const { data } = await supabase.storage
      .from('user-photos')
      .createSignedUrl(photo.storage_path, 3600)
    if (data?.signedUrl) {
      photoUrls[photo.id] = data.signedUrl
    }
  }

  return (
    <>
      <PortalHeader title="Update Avatar" description="Generate an AI avatar from your photos." />
      <AvatarWizard initialPhotos={userPhotos} photoUrls={photoUrls} />
    </>
  )
}
