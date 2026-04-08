export interface AvatarJob {
  id: string
  user_id: string
  status: 'generating' | 'complete' | 'error'
  image_url: string | null
  prompt: string
  created_at: string
}
