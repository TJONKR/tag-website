export type Rarity = 'common' | 'rare'
export type GenerationType = '2d' | '3d'
export type LootboxStatus = 'available' | 'opened'
export type SkinStatus = 'generating' | 'complete' | 'error'

export interface LootboxEvent {
  id: string
  name: string
  slug: string
  description: string | null
  active: boolean
  created_at: string
}

export interface LootboxStyle {
  id: string
  event_id: string
  name: string
  prompt: string
  preview_url: string | null
  rarity: Rarity
  generation_type: GenerationType
  weight: number
  created_at: string
}

export interface UserSkin {
  id: string
  user_id: string
  style_id: string | null
  image_url: string | null
  model_3d_url: string | null
  rarity: Rarity
  status: SkinStatus
  equipped: boolean
  created_at: string
  style?: LootboxStyle
}

export interface RolledCard {
  style_id: string
  rarity: Rarity
  name: string
  generation_type: GenerationType
}

export interface UserLootbox {
  id: string
  user_id: string
  event_id: string | null
  status: LootboxStatus
  cards: RolledCard[] | null
  chosen_style_id: string | null
  skin_id: string | null
  opened_at: string | null
  created_at: string
  event?: LootboxEvent
}
