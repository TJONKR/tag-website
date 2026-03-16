import { createServerSupabaseClient } from '@lib/db'

import type { UserPhoto } from './types'

export async function getUserPhotos(userId: string): Promise<UserPhoto[]> {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('user_photos')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (error) return []
  return data as UserPhoto[]
}

export async function getUserPhotoCount(userId: string): Promise<number> {
  const supabase = await createServerSupabaseClient()

  const { count, error } = await supabase
    .from('user_photos')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (error) return 0
  return count ?? 0
}

export async function getUserPhotoUrls(userId: string): Promise<string[]> {
  const supabase = await createServerSupabaseClient()

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
