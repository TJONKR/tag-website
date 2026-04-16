import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://cjvpeuxpwwwvxpjptslz.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
  // Find og-day-one event id
  const { data: event } = await supabase
    .from('lootbox_events')
    .select('id')
    .eq('slug', 'og-day-one')
    .single()
  if (!event) throw new Error('no og-day-one event')

  // All lootboxes on that event with source_event_id IS NULL
  // (these are "profile completion" / legacy og-day-one lootboxes)
  const { data: rows } = await supabase
    .from('user_lootboxes')
    .select('user_id, status, created_at')
    .eq('event_id', event.id)
    .is('source_event_id', null)
    .order('user_id')

  const byUser = new Map<string, { total: number; available: number; opened: number; dates: string[] }>()
  for (const r of rows ?? []) {
    const entry = byUser.get(r.user_id) ?? { total: 0, available: 0, opened: 0, dates: [] }
    entry.total++
    if (r.status === 'available') entry.available++
    else entry.opened++
    entry.dates.push(r.created_at.slice(0, 10))
    byUser.set(r.user_id, entry)
  }

  console.log(`\nUsers with MULTIPLE profile-completion og-day-one lootboxes:`)
  let dupCount = 0
  for (const [userId, v] of byUser.entries()) {
    if (v.total > 1) {
      dupCount++
      console.log(`  ${userId}: total=${v.total} available=${v.available} opened=${v.opened} dates=${v.dates.join(',')}`)
    }
  }
  console.log(`\nTotal users with duplicates: ${dupCount}`)
  console.log(`Total users with any og-day-one profile lootbox: ${byUser.size}`)
}

main().catch(console.error)
