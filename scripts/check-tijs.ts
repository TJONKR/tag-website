import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://cjvpeuxpwwwvxpjptslz.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const email = 'tijs@lerai.nl'

async function main() {
  // 1. auth.users lookup
  const { data: authList, error: authErr } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 500,
  })
  if (authErr) throw authErr
  const user = authList.users.find((u) => u.email === email)
  if (!user) {
    console.log(`No auth user for ${email}`)
    return
  }
  console.log(`\n── auth.users ────────────────`)
  console.log(`id: ${user.id}`)
  console.log(`email: ${user.email}`)
  console.log(`created_at: ${user.created_at}`)

  // 2. profiles row (onboarding fields live here)
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  console.log(`\n── profiles ──────────────────`)
  if (!profile) {
    console.log('(no profile row)')
  } else {
    console.log(`name: ${profile.name}`)
    console.log(`avatar_url: ${profile.avatar_url ? 'set' : '(empty)'}`)
    console.log(`role: ${profile.role}`)
    console.log(`building: ${profile.building ? profile.building.slice(0, 80) + '…' : '(empty)'}`)
    console.log(`why_tag: ${profile.why_tag ? profile.why_tag.slice(0, 80) + '…' : '(empty)'}`)
    console.log(`linkedin_url: ${profile.linkedin_url ?? '(empty)'}`)
    console.log(`twitter_url: ${profile.twitter_url ?? '(empty)'}`)
    console.log(`github_url: ${profile.github_url ?? '(empty)'}`)
    console.log(`website_url: ${profile.website_url ?? '(empty)'}`)
    console.log(`instagram_url: ${profile.instagram_url ?? '(empty)'}`)
  }

  // 3. photos count
  const { count: photoCount } = await supabase
    .from('user_photos')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
  console.log(`\n── user_photos ───────────────`)
  console.log(`count: ${photoCount ?? 0}`)

  // 4. lootboxes
  const { data: lootboxes } = await supabase
    .from('user_lootboxes')
    .select('id, status, event_id, source_event_id, chosen_style_id, skin_id, created_at, opened_at, lootbox_events(slug)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
  console.log(`\n── user_lootboxes ────────────`)
  console.log(`total: ${lootboxes?.length ?? 0}`)
  for (const lb of lootboxes ?? []) {
    const slug = (lb.lootbox_events as any)?.slug ?? '—'
    const origin = lb.source_event_id ? 'check-in' : lb.event_id ? 'profile' : 'test'
    console.log(
      `  [${lb.status}] origin=${origin} event=${slug} created=${lb.created_at.slice(0, 10)} opened=${lb.opened_at?.slice(0, 10) ?? '-'}`
    )
  }

  // 5. skins
  const { data: skins } = await supabase
    .from('user_skins')
    .select('id, status, rarity, equipped, image_url, created_at, lootbox_styles(name)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
  console.log(`\n── user_skins ────────────────`)
  console.log(`total: ${skins?.length ?? 0}`)
  for (const s of skins ?? []) {
    const style = (s.lootbox_styles as any)?.name ?? '—'
    console.log(
      `  [${s.status}] ${style} (${s.rarity})${s.equipped ? ' EQUIPPED' : ''} img=${s.image_url ? 'yes' : 'no'}`
    )
  }

  // 6. builder_profiles (AI enrichment)
  const { data: bp } = await supabase
    .from('builder_profiles')
    .select('status, headline, tags, completed_at, error, data_sources')
    .eq('user_id', user.id)
    .maybeSingle()
  console.log(`\n── builder_profiles (AI enrichment) ─`)
  if (!bp) {
    console.log('(no builder profile — AI enrichment never run)')
  } else {
    console.log(`status: ${bp.status}`)
    console.log(`headline: ${bp.headline ?? '-'}`)
    console.log(`tags: ${bp.tags?.join(', ') ?? '-'}`)
    console.log(`data_sources: ${bp.data_sources?.join(', ') ?? '-'}`)
    console.log(`completed_at: ${bp.completed_at ?? '-'}`)
    if (bp.error) console.log(`error: ${bp.error}`)
  }

  // 7. event_attendance / check-ins
  const { data: attendance } = await supabase
    .from('event_attendance')
    .select('event_id, checked_in_at, events(name, slug)')
    .eq('user_id', user.id)
    .not('checked_in_at', 'is', null)
  console.log(`\n── event check-ins ───────────`)
  console.log(`total: ${attendance?.length ?? 0}`)
  for (const a of attendance ?? []) {
    const ev = (a.events as any)
    console.log(`  ${ev?.name ?? '—'} (${a.checked_in_at?.slice(0, 10)})`)
  }

  console.log()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
