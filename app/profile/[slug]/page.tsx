import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  ExternalLink,
  Github,
  Globe,
  Instagram,
  Linkedin,
} from 'lucide-react'

import { PageShell } from '@components/page-shell'
import { getPublicProfile } from '@lib/auth/queries'
import { cn, slugifyName } from '@lib/utils'
import { getUserAttendedEvents } from '@lib/events/queries'
import { formatDateDisplay } from '@lib/events/types'
import { rarityStyles } from '@lib/lootbox/rarity'

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
  const headline = profile.taste?.headline
  const description =
    headline ??
    (profile.building
      ? `${name} — ${role} at TAG. Building: ${profile.building}`
      : `${name} — ${role} at TAG`)
  const ogImage = profile.equipped_skin_url ?? profile.avatar_url

  return {
    title: `${name} — TAG`,
    description,
    openGraph: {
      title: `${name} — TAG`,
      description,
      ...(ogImage && {
        images: [{ url: ogImage, width: 400, height: 400 }],
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
  const taste = profile.taste
  const hasSkin = !!profile.equipped_skin_url
  const rarity = profile.equipped_skin_rarity
    ? rarityStyles[profile.equipped_skin_rarity]
    : null

  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd(profile)) }}
      />

      <div className="px-[60px] py-16 max-md:px-8">
        <div className="mx-auto max-w-2xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-grotesk text-sm text-tag-muted transition-colors hover:text-tag-orange"
          >
            <ArrowLeft className="size-3.5" />
            Back
          </Link>

          <article className="mt-12">
            {/* Header: Avatar/skin + Info */}
            <header className="flex items-start gap-8 max-md:flex-col">
              {hasSkin ? (
                <div
                  className={cn(
                    'relative aspect-[3/4] w-40 shrink-0 overflow-hidden rounded-lg border-2 bg-tag-card max-md:w-32',
                    rarity ? [rarity.border, rarity.glow] : 'border-tag-border'
                  )}
                >
                  <Image
                    src={profile.equipped_skin_url!}
                    alt={name}
                    fill
                    className="object-cover"
                    sizes="160px"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="relative size-32 shrink-0 overflow-hidden rounded-full border border-tag-border bg-tag-card max-md:size-24">
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
              )}

              <div className="flex flex-col">
                <h1 className="font-syne text-3xl font-bold text-tag-text">
                  {name}
                </h1>
                {taste?.headline && (
                  <p className="mt-2 font-grotesk text-lg text-tag-orange">
                    {taste.headline}
                  </p>
                )}
                <div className="mt-2 flex items-center gap-3">
                  <span className="rounded bg-tag-orange/10 px-2 py-0.5 font-mono text-xs uppercase tracking-wider text-tag-orange">
                    {role}
                  </span>
                  <span className="font-mono text-xs text-tag-dim">
                    Member since {memberSince}
                  </span>
                </div>

                {taste?.tags && taste.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {taste.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-tag-orange/20 bg-tag-orange/5 px-2.5 py-0.5 text-sm text-tag-orange"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

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
              {taste?.prophecy && taste.prophecy.length === 3 && (
                <Section title="Prophecy">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {taste.prophecy.map((card) => (
                      <div
                        key={card.id}
                        className="overflow-hidden rounded-lg border border-tag-orange/30 bg-gradient-to-br from-tag-orange/10 via-tag-orange/[0.03] to-transparent"
                      >
                        {card.image_url && (
                          <div className="aspect-square w-full overflow-hidden bg-black">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={card.image_url}
                              alt=""
                              className="size-full object-cover"
                              style={{ imageRendering: 'pixelated' }}
                            />
                          </div>
                        )}
                        <div className="p-4">
                          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-tag-orange">
                            Round {card.round} ·{' '}
                            {card.round === 1
                              ? 'Surface'
                              : card.round === 2
                                ? 'Undercurrent'
                                : 'Horizon'}
                          </span>
                          <h4 className="mt-2 font-syne text-base font-bold leading-tight text-tag-text">
                            {card.title}
                          </h4>
                          <p className="mt-2 font-grotesk text-[12px] leading-relaxed text-tag-muted">
                            {card.narrative}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {taste?.bio && (
                <Section title="Bio">
                  <div className="space-y-3">
                    {taste.bio.split('\n\n').map((paragraph, i) => (
                      <p
                        key={i}
                        className="font-grotesk leading-relaxed text-tag-text"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </Section>
              )}

              {profile.building && (
                <Section title="What I'm building">
                  <p className="font-grotesk leading-relaxed text-tag-text">
                    {profile.building}
                  </p>
                </Section>
              )}

              {profile.why_tag && (
                <Section title="Why TAG">
                  <p className="font-grotesk leading-relaxed text-tag-text">
                    {profile.why_tag}
                  </p>
                </Section>
              )}

              {taste?.projects && taste.projects.length > 0 && (
                <Section title="Projects">
                  <div className="space-y-5">
                    {taste.projects.map((project, i) => (
                      <div key={i}>
                        <div className="flex items-center gap-2">
                          <span className="font-syne text-base font-medium text-tag-text">
                            {project.name}
                          </span>
                          {project.role && (
                            <span className="font-mono text-xs uppercase tracking-wider text-tag-dim">
                              {project.role}
                            </span>
                          )}
                          {project.url && (
                            <a
                              href={project.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-tag-orange hover:text-tag-orange/80"
                            >
                              <ExternalLink className="size-3.5" />
                            </a>
                          )}
                        </div>
                        <p className="mt-1 font-grotesk text-sm leading-relaxed text-tag-muted">
                          {project.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {taste?.notable_work && taste.notable_work.length > 0 && (
                <Section title="Notable work">
                  <ul className="space-y-2">
                    {taste.notable_work.map((work, i) => (
                      <li
                        key={i}
                        className="flex gap-2 font-grotesk text-sm text-tag-muted"
                      >
                        <span className="mt-1 text-tag-orange">•</span>
                        <span>{work}</span>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {taste?.interests && taste.interests.length > 0 && (
                <Section title="Interests">
                  <div className="flex flex-wrap gap-2">
                    {taste.interests.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-tag-border bg-tag-card px-3 py-1 font-grotesk text-sm text-tag-muted"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </Section>
              )}

              {taste?.influences && taste.influences.length > 0 && (
                <Section title="Influences">
                  <div className="flex flex-wrap gap-2">
                    {taste.influences.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-tag-border bg-tag-card px-3 py-1 font-grotesk text-sm text-tag-muted"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </Section>
              )}

              {taste?.key_links && taste.key_links.length > 0 && (
                <Section title="Links">
                  <div>
                    {taste.key_links.map((link, i) => (
                      <a
                        key={i}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 border-t border-t-tag-border py-2.5 font-grotesk text-sm text-tag-muted transition-colors first:border-t-0 hover:text-tag-orange"
                      >
                        <ExternalLink className="size-3.5 shrink-0" />
                        <span className="truncate">{link.title}</span>
                        <span className="ml-auto font-mono text-[10px] uppercase tracking-wider text-tag-dim">
                          {link.type}
                        </span>
                      </a>
                    ))}
                  </div>
                </Section>
              )}

              {events.length > 0 && (
                <Section title="Events attended">
                  <div>
                    {events.map((event) => (
                      <div
                        key={event.id}
                        className="flex flex-col gap-1 border-t border-t-tag-border py-3 first:border-t-0"
                      >
                        <div className="font-mono text-sm font-bold text-tag-orange">
                          {formatDateDisplay(event.date_iso)}
                        </div>
                        <span className="font-syne text-base text-tag-text">
                          {event.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </Section>
              )}
            </div>
          </article>
        </div>
      </div>
    </PageShell>
  )
}

const Section = ({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) => (
  <section>
    <h2 className="mb-3 font-mono text-xs uppercase tracking-[0.08em] text-tag-muted">
      {title}
    </h2>
    {children}
  </section>
)
