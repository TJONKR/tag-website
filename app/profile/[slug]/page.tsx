import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  Calendar,
  Github,
  Globe,
  Instagram,
  Linkedin,
} from 'lucide-react'

import { PageShell } from '@components/page-shell'
import { getPublicProfile } from '@lib/auth/queries'
import { slugifyName } from '@lib/utils'
import { getUserAttendedEvents } from '@lib/events/queries'
import { formatDateDisplay } from '@lib/events/types'

import type { PublicProfile } from '@lib/auth/types'

interface ProfilePageProps {
  params: Promise<{ slug: string }>
}

export const revalidate = 60

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

const socialLinks = [
  { key: 'linkedin_url' as const, icon: Linkedin, label: 'LinkedIn' },
  { key: 'twitter_url' as const, icon: XIcon, label: 'X' },
  { key: 'github_url' as const, icon: Github, label: 'GitHub' },
  { key: 'website_url' as const, icon: Globe, label: 'Website' },
  { key: 'instagram_url' as const, icon: Instagram, label: 'Instagram' },
]

const roleLabels: Record<string, string> = {
  ambassador: 'Ambassador',
  builder: 'Builder',
  operator: 'Operator',
}

function buildJsonLd(profile: PublicProfile) {
  const sameAs = [
    profile.linkedin_url,
    profile.twitter_url,
    profile.github_url,
    profile.website_url,
    profile.instagram_url,
  ].filter(Boolean)

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    ...(profile.avatar_url && { image: profile.avatar_url }),
    jobTitle: `${roleLabels[profile.role] ?? 'Member'} at TAG`,
    url: `https://tag.space/profile/${slugifyName(profile.name ?? '')}`,
    ...(sameAs.length > 0 && { sameAs }),
    memberOf: {
      '@type': 'Organization',
      name: 'TAG — To Achieve Greatness',
      url: 'https://tag.space',
    },
  }
}

export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  const { slug } = await params
  const profile = await getPublicProfile(slug)
  if (!profile) return {}

  const name = profile.name ?? 'Member'
  const role = roleLabels[profile.role] ?? 'Member'
  const description = profile.building
    ? `${name} — ${role} at TAG. Building: ${profile.building}`
    : `${name} — ${role} at TAG`

  return {
    title: `${name} — TAG`,
    description,
    openGraph: {
      title: `${name} — TAG`,
      description,
      ...(profile.avatar_url && {
        images: [{ url: profile.avatar_url, width: 400, height: 400 }],
      }),
    },
    twitter: {
      card: 'summary',
      title: `${name} — TAG`,
      description,
    },
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { slug } = await params
  const profile = await getPublicProfile(slug)
  if (!profile) notFound()

  const events = await getUserAttendedEvents(profile.id)

  const name = profile.name ?? 'Member'
  const role = roleLabels[profile.role] ?? 'Member'
  const memberSince = new Date(profile.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  const activeSocials = socialLinks.filter((s) => profile[s.key])

  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd(profile)) }}
      />

      <div className="px-[60px] py-16 max-md:px-8">
        <div className="mx-auto max-w-[1440px]">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-grotesk text-sm text-tag-muted transition-colors hover:text-tag-orange"
          >
            <ArrowLeft className="size-3.5" />
            Back
          </Link>

          <article className="mt-12">
            {/* Header: Avatar + Info */}
            <header className="flex items-start gap-8 max-md:flex-col">
              <div className="relative size-32 shrink-0 overflow-hidden rounded-lg border border-tag-border bg-tag-card max-md:size-24">
                {profile.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={name}
                    fill
                    className="object-cover"
                    sizes="128px"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="font-syne text-3xl font-bold text-tag-dim">
                      {name
                        .split(' ')
                        .map((w) => w[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col">
                <h1 className="font-syne text-3xl font-bold text-tag-text">
                  {name}
                </h1>
                <div className="mt-2 flex items-center gap-3">
                  <span className="rounded bg-tag-orange/10 px-2 py-0.5 font-mono text-xs uppercase tracking-wider text-tag-orange">
                    {role}
                  </span>
                  <span className="font-mono text-xs text-tag-dim">
                    Member since {memberSince}
                  </span>
                </div>

                {/* Social links */}
                {activeSocials.length > 0 && (
                  <div className="mt-4 flex items-center gap-2">
                    {activeSocials.map((social) => {
                      const Icon = social.icon
                      return (
                        <a
                          key={social.key}
                          href={profile[social.key]!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex size-8 items-center justify-center rounded-lg border border-tag-border text-tag-muted transition-colors hover:border-tag-orange hover:text-tag-orange"
                          aria-label={social.label}
                        >
                          <Icon className="size-4" />
                        </a>
                      )
                    })}
                  </div>
                )}
              </div>
            </header>

            {/* Content sections */}
            <div className="mt-12 max-w-2xl space-y-10">
              {/* What I'm building */}
              {profile.building && (
                <section>
                  <h2 className="mb-3 font-mono text-xs uppercase tracking-[0.08em] text-tag-muted">
                    What I&apos;m building
                  </h2>
                  <p className="font-grotesk leading-relaxed text-tag-text">
                    {profile.building}
                  </p>
                </section>
              )}

              {/* Why TAG */}
              {profile.why_tag && (
                <section>
                  <h2 className="mb-3 font-mono text-xs uppercase tracking-[0.08em] text-tag-muted">
                    Why TAG
                  </h2>
                  <p className="font-grotesk leading-relaxed text-tag-text">
                    {profile.why_tag}
                  </p>
                </section>
              )}

              {/* Events attended */}
              {events.length > 0 && (
                <section>
                  <h2 className="mb-3 font-mono text-xs uppercase tracking-[0.08em] text-tag-muted">
                    Events attended
                  </h2>
                  <div className="space-y-2">
                    {events.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center gap-3 rounded-lg border border-tag-border px-4 py-3"
                      >
                        <Calendar className="size-4 shrink-0 text-tag-orange" />
                        <span className="font-mono text-sm font-bold text-tag-orange">
                          {formatDateDisplay(event.date_iso)}
                        </span>
                        <span className="text-sm text-tag-text">
                          {event.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </article>
        </div>
      </div>
    </PageShell>
  )
}
