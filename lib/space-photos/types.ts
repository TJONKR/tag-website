export interface SpacePhotoTag {
  id: string
  user_id: string
  tagged_by: string | null
  tagged_at: string
  name: string | null
  avatar_url: string | null
}

export interface SpacePhoto {
  id: string
  storage_path: string
  caption: string | null
  sort_order: number
  taken_at: string | null
  created_at: string
  created_by: string | null
}

export interface SpacePhotoWithUrl extends SpacePhoto {
  url: string
  tags: SpacePhotoTag[]
}
