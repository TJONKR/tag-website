export type ProfileStatus =
  | 'pending'
  | 'researching'
  | 'formatting'
  | 'drawing_prophecy'
  | 'generating_skin'
  | 'complete'
  | 'error'

export type ProphecyRoundIndex = 1 | 2 | 3

export interface ProphecyCard {
  id: string
  round: ProphecyRoundIndex
  title: string
  narrative: string
  image_url: string | null
}

export interface ProphecyRound {
  cards: ProphecyCard[]
  picked_id: string | null
}

export type ProphecyRounds = ProphecyRound[]

export interface BuilderProfile {
  id: string
  user_id: string
  status: ProfileStatus
  status_message: string | null
  error: string | null
  input_name: string | null
  input_twitter: string | null
  input_linkedin: string | null
  input_github: string | null
  input_website: string | null
  input_building: string | null
  headline: string | null
  bio: string | null
  tags: string[] | null
  projects: { name: string; description: string; url?: string; role?: string }[] | null
  interests: string[] | null
  notable_work: string[] | null
  influences: string[] | null
  key_links: { url: string; title: string; type: string }[] | null
  avatar_url: string | null
  skin_url: string | null
  data_sources: string[] | null
  prophecy_rounds: ProphecyRounds | null
  prophecy_chosen: ProphecyCard[] | null
  prophecy_drawn_at: string | null
  show_headline: boolean
  show_bio: boolean
  show_tags: boolean
  show_projects: boolean
  show_interests: boolean
  show_notable_work: boolean
  show_influences: boolean
  show_key_links: boolean
  show_prophecy: boolean
  created_at: string
  completed_at: string | null
}

export type VisibilityField =
  | 'show_headline'
  | 'show_bio'
  | 'show_tags'
  | 'show_projects'
  | 'show_interests'
  | 'show_notable_work'
  | 'show_influences'
  | 'show_key_links'
  | 'show_prophecy'
