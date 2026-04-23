import { createServerSupabaseClient, createServiceRoleClient } from '@lib/db'

import type { SpacePhoto, SpacePhotoWithUrl } from './types'

const BUCKET = 'space-photos'

const attachPublicUrls = (
  photos: SpacePhoto[],
  supabase: ReturnType<typeof createServiceRoleClient>
): SpacePhotoWithUrl[] =>
  photos.map((photo) => {
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(photo.storage_path)
    return { ...photo, url: data.publicUrl }
  })

export const getSpacePhotos = async (): Promise<SpacePhotoWithUrl[]> => {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('space_photos')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)

  const photos = (data as SpacePhoto[]) ?? []
  return attachPublicUrls(photos, supabase)
}

export const getSpacePhotoById = async (
  id: string
): Promise<SpacePhotoWithUrl | null> => {
  const service = createServiceRoleClient()

  const { data, error } = await service
    .from('space_photos')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return null

  const [photo] = attachPublicUrls([data as SpacePhoto], service)
  return photo
}
