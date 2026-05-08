import type { Metadata } from 'next'

import { PageShell } from '@components/page-shell'
import { JoinHero, JoinForm } from '@lib/join/components'

const title = 'Join TAG'
const description =
  'Builders, hackers, and creators in Amsterdam. Request your spot and join the community.'

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description },
  twitter: { card: 'summary_large_image', title, description },
}

export default function JoinPage() {
  return (
    <PageShell>
      <JoinHero />
      <JoinForm />
    </PageShell>
  )
}
