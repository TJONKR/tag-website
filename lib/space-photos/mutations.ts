import { createServiceRoleClient } from '@lib/db'

import type { SpacePhoto } from './types'
import type { UpdateSpacePhotoInput } from './schema'

const BUCKET = 'space-photos'

const sanitizeExt = (name: string) => {
  const lower = name.toLowerCase()
  const match = lower.match(/\.(jpe?g|png|webp)$/)
  if (match) return match[1] === 'jpeg' ? 'jpg' : match[1]
  return 'jpg'
}

export const uploadSpacePhoto = async (
  file: File,
  createdBy: string,
  opts?: { caption?: string | null; takenAt?: string | null }
): Promise<SpacePhoto> => {
  const service = createServiceRoleClient()

  const ext = sanitizeExt(file.name)
  const storagePath = `${Date.now()}-${crypto.randomUUID()}.${ext}`

  const buffer = Buffer.from(await file.arrayBuffer())

  const { error: uploadError } = await service.storage
    .from(BUCKET)
    .upload(storagePath, buffer, {
      contentType: file.type || 'image/jpeg',
      upsert: false,
    })

  if (uploadError) throw new Error(uploadError.message)

  // Place new photos at the end of the current order.
  const { data: maxRow } = await service
    .from('space_photos')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const nextOrder = ((maxRow?.sort_order as number | undefined) ?? 0) + 1

  const { data, error } = await service
    .from('space_photos')
    .insert({
      storage_path: storagePath,
      caption: opts?.caption ?? null,
      taken_at: opts?.takenAt ?? null,
      sort_order: nextOrder,
      created_by: createdBy,
    })
    .select('*')
    .single()

  if (error) {
    // Roll back the storage upload if the metadata insert failed.
    await service.storage.from(BUCKET).remove([storagePath])
    throw new Error(error.message)
  }

  return data as SpacePhoto
}

export const tagUserInPhoto = async (
  photoId: string,
  userId: string,
  taggedBy: string
) => {
  const service = createServiceRoleClient()
  const { error } = await service
    .from('space_photo_tags')
    .insert({ photo_id: photoId, user_id: userId, tagged_by: taggedBy })

  // Unique violation means already tagged — treat as idempotent success.
  if (error && !error.message.toLowerCase().includes('duplicate')) {
    throw new Error(error.message)
  }
}

export const untagUserFromPhoto = async (photoId: string, userId: string) => {
  const service = createServiceRoleClient()
  const { error } = await service
    .from('space_photo_tags')
    .delete()
    .eq('photo_id', photoId)
    .eq('user_id', userId)

  if (error) throw new Error(error.message)
}

export const updateSpacePhoto = async (
  id: string,
  input: UpdateSpacePhotoInput
) => {
  const service = createServiceRoleClient()

  const { error } = await service
    .from('space_photos')
    .update({
      ...(input.caption !== undefined ? { caption: input.caption } : {}),
      ...(input.sort_order !== undefined ? { sort_order: input.sort_order } : {}),
    })
    .eq('id', id)

  if (error) throw new Error(error.message)
}

export const deleteSpacePhoto = async (id: string) => {
  const service = createServiceRoleClient()

  const { data: photo, error: fetchError } = await service
    .from('space_photos')
    .select('storage_path')
    .eq('id', id)
    .single()

  if (fetchError || !photo) throw new Error('Space photo not found')

  const { error: storageError } = await service.storage
    .from(BUCKET)
    .remove([photo.storage_path])

  if (storageError) throw new Error(storageError.message)

  const { error: deleteError } = await service
    .from('space_photos')
    .delete()
    .eq('id', id)

  if (deleteError) throw new Error(deleteError.message)
}

export const reorderSpacePhotos = async (ids: string[]) => {
  const service = createServiceRoleClient()

  await Promise.all(
    ids.map((id, index) =>
      service
        .from('space_photos')
        .update({ sort_order: index })
        .eq('id', id)
    )
  )
}
