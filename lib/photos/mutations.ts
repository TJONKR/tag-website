import { createServerSupabaseClient, createServiceRoleClient } from '@lib/db'

import { MAX_PHOTOS } from './types'

export async function uploadUserPhoto(userId: string, file: File) {
  const supabase = await createServerSupabaseClient()

  // Check count
  const { count } = await supabase
    .from('user_photos')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  if ((count ?? 0) >= MAX_PHOTOS) {
    throw new Error(`Maximum of ${MAX_PHOTOS} photos allowed`)
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const filename = `${crypto.randomUUID()}.${ext}`
  const storagePath = `${userId}/${filename}`

  const { error: uploadError } = await supabase.storage
    .from('user-photos')
    .upload(storagePath, file, { upsert: false })

  if (uploadError) throw new Error(uploadError.message)

  // Save record
  const { data, error } = await supabase
    .from('user_photos')
    .insert({ user_id: userId, storage_path: storagePath })
    .select('id')
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function deleteUserPhoto(userId: string, photoId: string) {
  const supabase = await createServerSupabaseClient()

  // Get the photo record first
  const { data: photo, error: fetchError } = await supabase
    .from('user_photos')
    .select('storage_path')
    .eq('id', photoId)
    .eq('user_id', userId)
    .single()

  if (fetchError || !photo) throw new Error('Photo not found')

  // Delete from storage
  await supabase.storage.from('user-photos').remove([photo.storage_path])

  // Delete record
  const { error } = await supabase
    .from('user_photos')
    .delete()
    .eq('id', photoId)
    .eq('user_id', userId)

  if (error) throw new Error(error.message)
}

export async function getSignedPhotoUrls(userId: string): Promise<string[]> {
  const supabase = createServiceRoleClient()

  const { data, error } = await supabase
    .from('user_photos')
    .select('storage_path')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (error || !data?.length) return []

  const urls: string[] = []
  for (const photo of data) {
    const { data: urlData } = await supabase.storage
      .from('user-photos')
      .createSignedUrl(photo.storage_path, 3600)

    if (urlData?.signedUrl) urls.push(urlData.signedUrl)
  }

  return urls
}
