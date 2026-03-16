import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ExternalLink } from 'lucide-react'

import { builders, getBuilderBySlug } from '@lib/builders/data'
import { getPublicBuilderProfile } from '@lib/taste/queries'
import { createServiceRoleClient } from '@lib/db'

interface BuilderPageProps {
  params: Promise<{ slug: string }>
}

export const generateStaticParams = () => builders.map((b) => ({ slug: b.slug }))

// Allow dynamic rendering for enriched data
export const dynamicParams = true
export const revalidate = 60

export const generateMetadata = async ({ params }: BuilderPageProps): Promise<Metadata> => {
  const { slug } = await params
  const builder = getBuilderBySlug(slug)
  if (!builder) return {}
  return {
    title: `${builder.name} — TAG`,
    description: `${builder.name}, ${builder.role} at TAG — To Achieve Greatness`,
  }
}

async function getEnrichedProfile(builderName: string) {
  try {
    const supabase = createServiceRoleClient()
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('name', builderName)
      .maybeSingle()

    if (!profile) return null
    return getPublicBuilderProfile(profile.id)
  } catch {
    return null
  }
}

const BuilderPage = async ({ params }: BuilderPageProps) => {
  const { slug } = await params
  const builder = getBuilderBySlug(slug)
  if (!builder) notFound()

  const enriched = await getEnrichedProfile(builder.name)

  return (
    <div className="min-h-screen bg-tag-bg">
      <div className="mx-auto max-w-4xl px-8 py-16">
        <Link
          href="/#builders"
          className="inline-flex items-center gap-2 font-grotesk text-sm text-tag-muted transition-colors hover:text-tag-orange"
        >
          <span>&larr;</span>
          <span>Back to builders</span>
        </Link>

        <div className="mt-12 grid grid-cols-[280px_1fr] gap-12 max-md:grid-cols-1">
          {/* Builder image or gradient fallback */}
          <div className="relative aspect-[3/4] overflow-hidden border border-tag-border">
            {builder.image ? (
              <Image
                src={builder.image}
                alt={builder.name}
                fill
                className="object-cover"
                sizes="280px"
              />
            ) : (
              <>
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(135deg, ${builder.gradientFrom}, ${builder.gradientTo})`,
                  }}
                />
                <div className="absolute inset-0 bg-tag-orange/30 mix-blend-multiply" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-syne text-5xl font-bold text-tag-text/60">
                    {builder.initials}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col justify-center">
            <h1 className="font-syne text-4xl font-bold text-tag-text">{builder.name}</h1>

            {enriched?.show_headline && enriched.headline ? (
              <p className="mt-2 font-grotesk text-lg text-tag-orange">
                {enriched.headline}
              </p>
            ) : (
              <p className="mt-2 font-grotesk text-lg text-tag-muted">{builder.role}</p>
            )}

            <div className="mt-6 flex items-center gap-2">
              <span
                className={`inline-block size-2 rounded-full ${builder.active ? 'bg-tag-orange' : 'bg-tag-dim'}`}
              />
              <span className="font-grotesk text-sm text-tag-muted">
                {builder.active ? 'Active builder' : 'Alumni'}
              </span>
            </div>

            {/* Enriched bio */}
            {enriched?.show_bio && enriched.bio ? (
              <div className="mt-8 space-y-3">
                {enriched.bio.split('\n\n').map((paragraph, i) => (
                  <p
                    key={i}
                    className="font-grotesk text-base leading-relaxed text-tag-dim"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            ) : (
              <p className="mt-8 font-grotesk text-base leading-relaxed text-tag-dim">
                Full profile coming soon. Stay tuned.
              </p>
            )}
          </div>
        </div>

        {/* Enriched sections below the fold */}
        {enriched && (
          <div className="mt-16 space-y-8">
            {/* Tags */}
            {enriched.show_tags && enriched.tags && enriched.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {enriched.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-tag-orange/20 bg-tag-orange/5 px-3 py-1 text-sm text-tag-orange"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Projects */}
            {enriched.show_projects &&
              enriched.projects &&
              enriched.projects.length > 0 && (
                <div>
                  <h2 className="mb-4 font-syne text-lg font-bold text-tag-text">
                    Projects
                  </h2>
                  <div className="space-y-4">
                    {enriched.projects.map((project, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-tag-text">
                            {project.name}
                          </span>
                          {project.url && (
                            <a
                              href={project.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-tag-orange hover:text-tag-orange/80"
                            >
                              <ExternalLink className="size-3" />
                            </a>
                          )}
                        </div>
                        <p className="text-sm text-tag-dim">
                          {project.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Notable Work */}
            {enriched.show_notable_work &&
              enriched.notable_work &&
              enriched.notable_work.length > 0 && (
                <div>
                  <h2 className="mb-4 font-syne text-lg font-bold text-tag-text">
                    Notable Work
                  </h2>
                  <ul className="space-y-2">
                    {enriched.notable_work.map((work, i) => (
                      <li key={i} className="flex gap-2 text-sm text-tag-dim">
                        <span className="mt-0.5 text-tag-orange">•</span>
                        <span>{work}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {/* Key Links */}
            {enriched.show_key_links &&
              enriched.key_links &&
              enriched.key_links.length > 0 && (
                <div>
                  <h2 className="mb-4 font-syne text-lg font-bold text-tag-text">
                    Links
                  </h2>
                  <div className="space-y-2">
                    {enriched.key_links.map((link, i) => (
                      <a
                        key={i}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-tag-dim transition-colors hover:text-tag-orange"
                      >
                        <ExternalLink className="size-3 shrink-0" />
                        <span>{link.title}</span>
                        <span className="font-mono text-[10px] text-tag-dim/50">
                          {link.type}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  )
}

export default BuilderPage
