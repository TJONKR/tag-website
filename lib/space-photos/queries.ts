import { createServerSupabaseClient, createServiceRoleClient } from '@lib/db'

import type { SpacePhoto, SpacePhotoTag, SpacePhotoWithUrl } from './types'

const BUCKET = 'space-photos'

interface TagRow {
  id: string
  photo_id: string
  user_id: string
  tagged_by: string | null
  tagged_at: string
  profiles: { name: string | null; avatar_url: string | null } | null
}

const attachPublicUrls = (
  photos: SpacePhoto[],
  supabase: ReturnType<typeof createServiceRoleClient>
): (SpacePhotoWithUrl & { tags: [] })[] =>
  photos.map((photo) => {
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(photo.storage_path)
    return { ...photo, url: data.publicUrl, tags: [] }
  })

const hydrateTags = async (
  photos: (SpacePhotoWithUrl & { tags: SpacePhotoTag[] })[],
  supabase: ReturnType<typeof createServiceRoleClient>
): Promise<SpacePhotoWithUrl[]> => {
  if (photos.length === 0) return photos
  const ids = photos.map((p) => p.id)
  const { data } = await supabase
    .from('space_photo_tags')
    .select('id, photo_id, user_id, tagged_by, tagged_at, profiles:user_id(name, avatar_url)')
    .in('photo_id', ids)

  const byPhoto = new Map<string, SpacePhotoTag[]>()
  for (const row of (data as TagRow[] | null) ?? []) {
    const tag: SpacePhotoTag = {
      id: row.id,
      user_id: row.user_id,
      tagged_by: row.tagged_by,
      tagged_at: row.tagged_at,
      name: row.profiles?.name ?? null,
      avatar_url: row.profiles?.avatar_url ?? null,
    }
    const bucket = byPhoto.get(row.photo_id)
    if (bucket) bucket.push(tag)
    else byPhoto.set(row.photo_id, [tag])
  }

  return photos.map((p) => ({ ...p, tags: byPhoto.get(p.id) ?? [] }))
}

export const getSpacePhotos = async (): Promise<SpacePhotoWithUrl[]> => {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('space_photos')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('taken_at', { ascending: false, nullsFirst: false })

  if (error) throw new Error(error.message)

  const withUrls = attachPublicUrls((data as SpacePhoto[]) ?? [], supabase)
  return hydrateTags(withUrls, supabase)
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
  const [hydrated] = await hydrateTags([photo], service)
  return hydrated
}
