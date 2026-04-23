export interface SpacePhoto {
  id: string
  storage_path: string
  caption: string | null
  sort_order: number
  created_at: string
  created_by: string | null
}

export interface SpacePhotoWithUrl extends SpacePhoto {
  url: string
}
