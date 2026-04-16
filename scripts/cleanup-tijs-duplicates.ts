import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://cjvpeuxpwwwvxpjptslz.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const TIJS_ID = 'ef8bf8b9-93d8-4b56-abe2-a0f16e6b88b7'

async function main() {
  const { data: event } = await supabase
    .from('lootbox_events')
    .select('id')
    .eq('slug', 'og-day-one')
    .single()
  if (!event) throw new Error('no og-day-one event')

  // Find duplicate available profile-completion og-day-one rows for Tijs.
  // Safe predicates: user, event, status=available, source_event_id IS NULL.
  // The two legitimate rows are both `opened` (2026-03-16 and 2026-04-13),
  // so targeting `available` cannot touch them.
  const { data: dupes } = await supabase
    .from('user_lootboxes')
    .select('id, status, created_at, cards')
    .eq('user_id', TIJS_ID)
    .eq('event_id', event.id)
    .is('source_event_id', null)
    .eq('status', 'available')

  console.log(`Found ${dupes?.length ?? 0} duplicate rows to delete:`)
  for (const d of dupes ?? []) {
    console.log(`  ${d.id}  status=${d.status}  created=${d.created_at}  cards=${d.cards ? 'yes' : 'no'}`)
  }

  if (!dupes || dupes.length === 0) {
    console.log('Nothing to delete.')
    return
  }

  const ids = dupes.map((d) => d.id)
  const { error } = await supabase.from('user_lootboxes').delete().in('id', ids)
  if (error) throw error
  console.log(`\nDeleted ${ids.length} rows.`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
