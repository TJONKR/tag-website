import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://cjvpeuxpwwwvxpjptslz.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
  // All auth users
  const { data: authList, error: authErr } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 500,
  })
  if (authErr) throw authErr

  // All profiles + related counts in one pass
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name, avatar_url, role, building, why_tag, linkedin_url, twitter_url, github_url, website_url, instagram_url, created_at')

  // Photos per user
  const { data: photos } = await supabase
    .from('user_photos')
    .select('user_id')
  const photoCountMap = new Map<string, number>()
  for (const p of photos ?? []) {
    photoCountMap.set(p.user_id, (photoCountMap.get(p.user_id) ?? 0) + 1)
  }

  // og-day-one event id
  const { data: event } = await supabase
    .from('lootbox_events')
    .select('id')
    .eq('slug', 'og-day-one')
    .single()

  // All lootboxes
  const { data: lootboxes } = await supabase
    .from('user_lootboxes')
    .select('user_id, status, event_id, source_event_id')

  // Builder profiles (AI enrichment)
  const { data: builders } = await supabase
    .from('builder_profiles')
    .select('user_id, status, completed_at')

  // user_skins
  const { data: skins } = await supabase
    .from('user_skins')
    .select('user_id, status')

  const emailMap = new Map(authList.users.map((u) => [u.id, u.email]))

  type Row = {
    email: string
    name: string
    role: string
    completeSteps: number
    lbProfileAvail: number
    lbProfileOpened: number
    lbCheckinAvail: number
    lbCheckinOpened: number
    lbTestAvail: number
    lbTestOpened: number
    skinsComplete: number
    aiStatus: string
  }

  const rows: Row[] = []

  for (const profile of profiles ?? []) {
    const email = emailMap.get(profile.id) ?? '(unknown)'
    const hasSocial =
      !!profile.linkedin_url ||
      !!profile.twitter_url ||
      !!profile.github_url ||
      !!profile.website_url ||
      !!profile.instagram_url
    const photoCount = photoCountMap.get(profile.id) ?? 0
    const steps = [
      !!profile.name,
      !!profile.avatar_url,
      !!profile.building,
      !!profile.why_tag,
      hasSocial,
      photoCount >= 3,
    ]
    const completeSteps = steps.filter(Boolean).length

    const userLootboxes = (lootboxes ?? []).filter((l) => l.user_id === profile.id)
    let lbProfileAvail = 0, lbProfileOpened = 0
    let lbCheckinAvail = 0, lbCheckinOpened = 0
    let lbTestAvail = 0, lbTestOpened = 0
    for (const lb of userLootboxes) {
      const opened = lb.status === 'opened'
      if (lb.source_event_id) {
        opened ? lbCheckinOpened++ : lbCheckinAvail++
      } else if (lb.event_id === event?.id) {
        opened ? lbProfileOpened++ : lbProfileAvail++
      } else {
        opened ? lbTestOpened++ : lbTestAvail++
      }
    }

    const skinsComplete = (skins ?? []).filter(
      (s) => s.user_id === profile.id && s.status === 'complete'
    ).length

    const bp = (builders ?? []).find((b) => b.user_id === profile.id)
    const aiStatus = bp?.status ?? '—'

    rows.push({
      email,
      name: profile.name ?? '(no name)',
      role: profile.role,
      completeSteps,
      lbProfileAvail,
      lbProfileOpened,
      lbCheckinAvail,
      lbCheckinOpened,
      lbTestAvail,
      lbTestOpened,
      skinsComplete,
      aiStatus,
    })
  }

  rows.sort((a, b) => b.completeSteps - a.completeSteps || a.email.localeCompare(b.email))

  console.log(
    `\nTotal users: ${rows.length}\n`
  )
  console.log(
    'EMAIL'.padEnd(36) +
      'STEPS'.padEnd(7) +
      'ROLE'.padEnd(12) +
      'PROF_A/O'.padEnd(10) +
      'CHK_A/O'.padEnd(10) +
      'TST_A/O'.padEnd(10) +
      'SKINS'.padEnd(7) +
      'AI'
  )
  console.log('─'.repeat(100))
  for (const r of rows) {
    console.log(
      (r.email || '').slice(0, 35).padEnd(36) +
        `${r.completeSteps}/6`.padEnd(7) +
        r.role.padEnd(12) +
        `${r.lbProfileAvail}/${r.lbProfileOpened}`.padEnd(10) +
        `${r.lbCheckinAvail}/${r.lbCheckinOpened}`.padEnd(10) +
        `${r.lbTestAvail}/${r.lbTestOpened}`.padEnd(10) +
        `${r.skinsComplete}`.padEnd(7) +
        r.aiStatus
    )
  }

  // Flag specific issues
  console.log('\n── ISSUES ──────────────────────────────')
  const stuckReady = rows.filter(
    (r) => r.completeSteps === 6 && r.lbProfileAvail === 0 && r.lbProfileOpened === 0
  )
  if (stuckReady.length > 0) {
    console.log(`${stuckReady.length} users are 6/6 complete but have NO profile lootbox:`)
    for (const r of stuckReady) console.log(`  ${r.email} — ${r.name}`)
  } else {
    console.log('No users stuck at 6/6 without a lootbox.')
  }

  const closeOnes = rows.filter((r) => r.completeSteps === 5)
  if (closeOnes.length > 0) {
    console.log(`\n${closeOnes.length} users at 5/6 (next render will grant):`)
    for (const r of closeOnes) console.log(`  ${r.email} — ${r.name}`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
