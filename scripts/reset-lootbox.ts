/**
 * Reset a user's lootbox system data and grant a fresh OG Day One lootbox.
 *
 * Usage:
 *   npx tsx scripts/reset-lootbox.ts <user-email>
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function main() {
  const email = process.argv[2]
  if (!email) {
    console.error('Usage: npx tsx scripts/reset-lootbox.ts <user-email>')
    process.exit(1)
  }

  // Find user by email
  const { data: authUsers } = await supabase.auth.admin.listUsers()
  const authUser = authUsers?.users?.find((u) => u.email === email)
  if (!authUser) {
    console.error(`User not found: ${email}`)
    process.exit(1)
  }

  const userId = authUser.id
  console.log(`\nResetting lootbox data for ${email} (${userId})...\n`)

  // 1. Delete lootboxes first (FK references skins)
  const { error: lootboxesErr } = await supabase
    .from('user_lootboxes')
    .delete()
    .eq('user_id', userId)
  console.log(`  Deleted lootboxes${lootboxesErr ? ` (error: ${lootboxesErr.message})` : ''}`)

  // 2. Delete skins (now safe, no FK pointing here)
  const { error: skinsErr } = await supabase
    .from('user_skins')
    .delete()
    .eq('user_id', userId)
  console.log(`  Deleted skins${skinsErr ? ` (error: ${skinsErr.message})` : ''}`)

  // 3. Reset builder_profiles skin_url
  await supabase
    .from('builder_profiles')
    .update({ skin_url: null })
    .eq('user_id', userId)
  console.log(`  Reset builder_profiles.skin_url`)

  // 4. Get OG Day One event
  const { data: event } = await supabase
    .from('lootbox_events')
    .select('id')
    .eq('slug', 'og-day-one')
    .single()

  if (!event) {
    console.error('OG Day One event not found — run migrations first')
    process.exit(1)
  }

  // 5. Grant fresh lootbox
  const { data: lootbox, error } = await supabase
    .from('user_lootboxes')
    .insert({
      user_id: userId,
      event_id: event.id,
      status: 'available',
    })
    .select('id')
    .single()

  if (error) {
    console.error('Failed to create lootbox:', error.message)
    process.exit(1)
  }

  console.log(`  Created fresh lootbox: ${lootbox.id}`)
  console.log(`\nDone! User can now open their lootbox at /portal/profile\n`)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
