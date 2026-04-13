/**
 * Seed 30 global lootbox skin styles.
 *
 * Usage:
 *   pnpm tsx scripts/seed-skins.ts
 */
import path from 'path'

import { config as loadEnv } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

import { GLOBAL_STYLES } from './lib/skin-styles'

loadEnv({ path: path.join(__dirname, '..', '.env.local') })

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
  console.log(`Seeding ${GLOBAL_STYLES.length} global lootbox styles...\n`)

  const rows = GLOBAL_STYLES.map((style) => ({
    event_id: null,
    name: style.name,
    prompt: style.prompt,
    rarity: style.rarity,
    generation_type: style.generation_type,
    weight: style.weight,
  }))

  const { data, error } = await supabase
    .from('lootbox_styles')
    .insert(rows)
    .select('id, name, rarity')

  if (error) {
    console.error('Failed to insert styles:', error.message)
    process.exit(1)
  }

  console.log(`Inserted ${data.length} styles:\n`)

  const grouped = {
    common: data.filter((s) => s.rarity === 'common'),
    rare: data.filter((s) => s.rarity === 'rare'),
    epic: data.filter((s) => s.rarity === 'epic'),
  }

  for (const [rarity, styles] of Object.entries(grouped)) {
    console.log(`  ${rarity.toUpperCase()} (${styles.length}):`)
    for (const s of styles) {
      console.log(`    - ${s.name}`)
    }
    console.log()
  }

  console.log('Done! Global styles are now available for all events.\n')
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
