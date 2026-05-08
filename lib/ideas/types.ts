export type IdeaCategory = 'event' | 'feature' | 'community' | 'other'
export type IdeaStatus = 'new' | 'in_review' | 'planned' | 'done' | 'rejected'

export interface Idea {
  id: string
  user_id: string
  title: string
  body: string
  category: IdeaCategory
  status: IdeaStatus
  admin_note: string | null
  created_at: string
  updated_at: string
}

export interface IdeaAuthor {
  id: string
  name: string | null
  avatar_url: string | null
}

export interface IdeaWithAuthor extends Idea {
  author: IdeaAuthor | null
}
