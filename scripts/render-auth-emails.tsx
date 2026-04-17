import React from 'react'
import { render } from '@react-email/render'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'

import { BRAND } from '@lib/email/config'
import { SupabaseChangeEmail } from '@lib/email/templates/supabase-change-email'
import { SupabaseConfirmSignup } from '@lib/email/templates/supabase-confirm-signup'
import { SupabaseInvite } from '@lib/email/templates/supabase-invite'
import { SupabaseMagicLink } from '@lib/email/templates/supabase-magic-link'
import { SupabasePasswordReset } from '@lib/email/templates/supabase-password-reset'
import { SupabaseReauthentication } from '@lib/email/templates/supabase-reauthentication'

const OUT_DIR = join(process.cwd(), 'docs', 'supabase-auth-templates')
const LOGO_PATH = join(process.cwd(), 'public', 'images', 'tag-logo-email.png')

const templates = [
  { name: 'confirm-signup', component: <SupabaseConfirmSignup /> },
  { name: 'invite', component: <SupabaseInvite /> },
  { name: 'magic-link', component: <SupabaseMagicLink /> },
  { name: 'change-email', component: <SupabaseChangeEmail /> },
  { name: 'password-reset', component: <SupabasePasswordReset /> },
  { name: 'reauthentication', component: <SupabaseReauthentication /> },
]

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Supabase Dashboard sandboxes external images in its preview pane, so the
// hosted logo renders as a broken icon even though the URL is valid. Inlining
// the logo as a data URI fixes the preview and works in every modern mail
// client. The logo is ~2.5KB base64 — trivial overhead per email.
const inlineLogo = async (html: string): Promise<string> => {
  const buf = await readFile(LOGO_PATH)
  const dataUri = `data:image/png;base64,${buf.toString('base64')}`
  const pattern = new RegExp(escapeRegex(BRAND.logoUrl), 'g')
  return html.replace(pattern, dataUri)
}

const main = async () => {
  await mkdir(OUT_DIR, { recursive: true })

  for (const { name, component } of templates) {
    const rendered = await render(component, { pretty: true })
    const html = await inlineLogo(rendered)
    const outPath = join(OUT_DIR, `${name}.html`)
    await mkdir(dirname(outPath), { recursive: true })
    await writeFile(outPath, html)
    console.log(`wrote ${outPath}`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
