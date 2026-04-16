import { createServiceRoleClient } from '@lib/db'
import { getUserEmail, sendSkinComplete, sendSkinFailed } from '@lib/email/senders'

import type { GenerationType, LootboxStyle, RolledCard, SkinStatus } from './types'

/**
 * Roll 4 cards from an event's style pool using weighted random selection.
 * Returns the rolled cards and creates the lootbox record.
 */
export async function openLootbox(userId: string, eventId: string) {
  const supabase = createServiceRoleClient()

  // Prevent duplicate lootbox creation for the same user+event
  const { data: existing } = await supabase
    .from('user_lootboxes')
    .select('id, cards')
    .eq('user_id', userId)
    .eq('event_id', eventId)
    .eq('status', 'available')
    .maybeSingle()

  if (existing) {
    return { lootboxId: existing.id, cards: existing.cards as RolledCard[] }
  }

  // Get event-specific + global styles
  const { data: styles, error: stylesError } = await supabase
    .from('lootbox_styles')
    .select('*')
    .or(`event_id.eq.${eventId},event_id.is.null`)

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

  // Capture prior status so we only email on transitions into complete/error,
  // not on idempotent re-writes.
  const { data: prior } = await supabase
    .from('user_skins')
    .select('status, user_id')
    .eq('id', skinId)
    .single()

  const { error } = await supabase
    .from('user_skins')
    .update({
      status,
      ...(imageUrl && { image_url: imageUrl }),
      ...(model3dUrl && { model_3d_url: model3dUrl }),
    })
    .eq('id', skinId)

  if (error) throw new Error(error.message)

  if (!prior || prior.status === status) return
  if (status !== 'complete' && status !== 'error') return

  const userId = prior.user_id as string
  const email = await getUserEmail(userId)
  if (!email) return

  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', userId)
    .single()
  const name = profile?.name ?? undefined

  if (status === 'complete') {
    // Fetch style name + rarity for a friendlier email.
    const { data: skin } = await supabase
      .from('user_skins')
      .select('rarity, style_id, image_url, lootbox_styles(name)')
      .eq('id', skinId)
      .single()

    const styleName = (skin?.lootbox_styles as { name?: string } | null)?.name
    await sendSkinComplete({
      to: email,
      name,
      skinName: styleName,
      rarity: skin?.rarity as string | undefined,
      imageUrl: (skin?.image_url as string | undefined) ?? imageUrl,
    })
  } else {
    await sendSkinFailed({ to: email, name })
  }
}

/**
 * Reset a failed skin back to 'generating' and return the info needed to re-run the pipeline.
 */
export async function retrySkinGeneration(userId: string, skinId: string) {
  const supabase = createServiceRoleClient()

  const { data: skin, error } = await supabase
    .from('user_skins')
    .select('id, style_id, rarity')
    .eq('id', skinId)
    .eq('user_id', userId)
    .eq('status', 'error')
    .single()

  if (error || !skin) {
    throw new Error('Skin not found or not in error state')
  }

  const { data: style } = await supabase
    .from('lootbox_styles')
    .select('generation_type')
    .eq('id', skin.style_id)
    .single()

  if (!style) throw new Error('Style not found')

  await supabase
    .from('user_skins')
    .update({ status: 'generating' as SkinStatus })
    .eq('id', skinId)

  return {
    skinId: skin.id,
    styleId: skin.style_id,
    generationType: style.generation_type as GenerationType,
  }
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

/**
 * Roll cards lazily for an existing (already-granted) lootbox.
 * Used for check-in lootboxes that are created without cards by the DB trigger.
 * Pulls from ALL styles in the system (global + every event's pool).
 */
export async function rollLootboxCards(userId: string, lootboxId: string) {
  const supabase = createServiceRoleClient()

  // Verify ownership + state
  const { data: lootbox, error: lbError } = await supabase
    .from('user_lootboxes')
    .select('id, cards, status')
    .eq('id', lootboxId)
    .eq('user_id', userId)
    .single()

  if (lbError || !lootbox) {
    throw new Error('Lootbox not found')
  }

  if (lootbox.status !== 'available') {
    throw new Error('Lootbox already opened')
  }

  // Idempotent: if cards already rolled, return them
  if (lootbox.cards && Array.isArray(lootbox.cards) && lootbox.cards.length > 0) {
    return { lootboxId: lootbox.id, cards: lootbox.cards as RolledCard[] }
  }

  // Pull from ALL styles (global + every event)
  const { data: styles, error: stylesError } = await supabase
    .from('lootbox_styles')
    .select('*')

  if (stylesError || !styles?.length) {
    throw new Error('No styles available')
  }

  const cards = rollCards(styles as LootboxStyle[], 4)

  const { error: updateError } = await supabase
    .from('user_lootboxes')
    .update({ cards })
    .eq('id', lootboxId)

  if (updateError) throw new Error(updateError.message)

  return { lootboxId: lootbox.id, cards }
}

/**
 * Grant a user their first lootbox once they've completed onboarding.
 * Uses the og-day-one styles. Idempotent: a user gets at most one
 * profile-completion lootbox (event_id = og-day-one, source_event_id IS NULL).
 * Returns true if a new lootbox was granted, false if one already existed.
 */
export async function ensureFirstLootbox(userId: string): Promise<boolean> {
  const supabase = createServiceRoleClient()

  const { data: event } = await supabase
    .from('lootbox_events')
    .select('id')
    .eq('slug', 'og-day-one')
    .eq('active', true)
    .single()

  if (!event) return false

  // A profile-completion lootbox is one tied to og-day-one with no source event.
  // Check-in lootboxes are tracked via source_event_id, so they don't collide.
  // We use limit(1) (not maybeSingle) because legacy data may have >1 matching
  // row — single/maybeSingle would error and fall through to a duplicate insert.
  const { data: existing } = await supabase
    .from('user_lootboxes')
    .select('id')
    .eq('user_id', userId)
    .eq('event_id', event.id)
    .is('source_event_id', null)
    .limit(1)

  if (existing && existing.length > 0) return false

  const { error } = await supabase
    .from('user_lootboxes')
    .insert({
      user_id: userId,
      event_id: event.id,
      status: 'available',
    })

  if (error) {
    console.error('[ensureFirstLootbox] insert failed:', error.message)
    return false
  }
  return true
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
