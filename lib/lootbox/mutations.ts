import { createServiceRoleClient } from '@lib/db'

import type { LootboxStyle, RolledCard, SkinStatus } from './types'

/**
 * Roll 4 cards from an event's style pool using weighted random selection.
 * Returns the rolled cards and creates the lootbox record.
 */
export async function openLootbox(userId: string, eventId: string) {
  const supabase = createServiceRoleClient()

  // Get all styles for this event
  const { data: styles, error: stylesError } = await supabase
    .from('lootbox_styles')
    .select('*')
    .eq('event_id', eventId)

  if (stylesError || !styles?.length) {
    throw new Error('No styles available for this event')
  }

  // Weighted random selection of 4 cards
  const cards = rollCards(styles as LootboxStyle[], 4)

  // Create lootbox record
  const { data, error } = await supabase
    .from('user_lootboxes')
    .insert({
      user_id: userId,
      event_id: eventId,
      status: 'available',
      cards,
    })
    .select('id')
    .single()

  if (error) throw new Error(error.message)
  return { lootboxId: data.id, cards }
}

/**
 * User picks a card from their lootbox. Creates a skin record and marks lootbox as opened.
 */
export async function chooseSkin(
  userId: string,
  lootboxId: string,
  styleId: string
) {
  const supabase = createServiceRoleClient()

  // Verify the lootbox belongs to the user and is still available
  const { data: lootbox, error: lbError } = await supabase
    .from('user_lootboxes')
    .select('*')
    .eq('id', lootboxId)
    .eq('user_id', userId)
    .eq('status', 'available')
    .single()

  if (lbError || !lootbox) {
    throw new Error('Lootbox not found or already opened')
  }

  // Verify the chosen style is in the rolled cards
  const cards = lootbox.cards as RolledCard[]
  const chosenCard = cards.find((c) => c.style_id === styleId)
  if (!chosenCard) {
    throw new Error('Style not found in rolled cards')
  }

  // Create skin record
  const { data: skin, error: skinError } = await supabase
    .from('user_skins')
    .insert({
      user_id: userId,
      style_id: styleId,
      rarity: chosenCard.rarity,
      status: 'generating' as SkinStatus,
      equipped: false,
    })
    .select('id')
    .single()

  if (skinError) throw new Error(skinError.message)

  // Update lootbox
  const { error: updateError } = await supabase
    .from('user_lootboxes')
    .update({
      status: 'opened',
      chosen_style_id: styleId,
      skin_id: skin.id,
      opened_at: new Date().toISOString(),
    })
    .eq('id', lootboxId)

  if (updateError) throw new Error(updateError.message)

  return { skinId: skin.id, rarity: chosenCard.rarity, generationType: chosenCard.generation_type }
}

export async function updateSkinStatus(
  skinId: string,
  status: SkinStatus,
  imageUrl?: string,
  model3dUrl?: string
) {
  const supabase = createServiceRoleClient()

  const { error } = await supabase
    .from('user_skins')
    .update({
      status,
      ...(imageUrl && { image_url: imageUrl }),
      ...(model3dUrl && { model_3d_url: model3dUrl }),
    })
    .eq('id', skinId)

  if (error) throw new Error(error.message)
}

export async function equipSkin(userId: string, skinId: string) {
  const supabase = createServiceRoleClient()

  // Unequip all current skins
  const { error: unequipError } = await supabase
    .from('user_skins')
    .update({ equipped: false })
    .eq('user_id', userId)
    .eq('equipped', true)

  if (unequipError) throw new Error(unequipError.message)

  // Equip the chosen skin
  const { error } = await supabase
    .from('user_skins')
    .update({ equipped: true })
    .eq('id', skinId)
    .eq('user_id', userId)
    .eq('status', 'complete')

  if (error) throw new Error(error.message)
}

export async function grantLootbox(userId: string, eventSlug: string) {
  const supabase = createServiceRoleClient()

  const { data: event } = await supabase
    .from('lootbox_events')
    .select('id')
    .eq('slug', eventSlug)
    .eq('active', true)
    .single()

  if (!event) throw new Error(`Event "${eventSlug}" not found`)

  // Check if user already has a lootbox for this event
  const { data: existing } = await supabase
    .from('user_lootboxes')
    .select('id')
    .eq('user_id', userId)
    .eq('event_id', event.id)
    .maybeSingle()

  if (existing) return existing

  const { data, error } = await supabase
    .from('user_lootboxes')
    .insert({
      user_id: userId,
      event_id: event.id,
      status: 'available',
    })
    .select('id')
    .single()

  if (error) throw new Error(error.message)
  return data
}

// ─── Helpers ──────────────────────────────────────────────────

function rollCards(styles: LootboxStyle[], count: number): RolledCard[] {
  const totalWeight = styles.reduce((sum, s) => sum + s.weight, 0)
  const cards: RolledCard[] = []

  for (let i = 0; i < count; i++) {
    let roll = Math.random() * totalWeight
    let selected = styles[0]

    for (const style of styles) {
      roll -= style.weight
      if (roll <= 0) {
        selected = style
        break
      }
    }

    cards.push({
      style_id: selected.id,
      rarity: selected.rarity as RolledCard['rarity'],
      name: selected.name,
      generation_type: selected.generation_type as RolledCard['generation_type'],
    })
  }

  return cards
}
