export interface UserPhoto {
  id: string
  user_id: string
  storage_path: string
  created_at: string
}

export const MAX_PHOTOS = 3
export const MAX_PHOTO_SIZE = 2 * 1024 * 1024 // 2MB
