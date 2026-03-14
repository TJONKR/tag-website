import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { builders, getBuilderBySlug } from '@lib/builders/data'

interface BuilderPageProps {
  params: Promise<{ slug: string }>
}

export const generateStaticParams = () => builders.map((b) => ({ slug: b.slug }))

export const generateMetadata = async ({ params }: BuilderPageProps): Promise<Metadata> => {
  const { slug } = await params
  const builder = getBuilderBySlug(slug)
  if (!builder) return {}
  return {
    title: `${builder.name} — TAG`,
    description: `${builder.name}, ${builder.role} at TAG — To Achieve Greatness`,
  }
}

const BuilderPage = async ({ params }: BuilderPageProps) => {
  const { slug } = await params
  const builder = getBuilderBySlug(slug)
  if (!builder) notFound()

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
            <p className="mt-2 font-grotesk text-lg text-tag-muted">{builder.role}</p>

            <div className="mt-6 flex items-center gap-2">
              <span
                className={`inline-block size-2 rounded-full ${builder.active ? 'bg-tag-orange' : 'bg-tag-dim'}`}
              />
              <span className="font-grotesk text-sm text-tag-muted">
                {builder.active ? 'Active builder' : 'Alumni'}
              </span>
            </div>

            <p className="mt-8 font-grotesk text-base leading-relaxed text-tag-dim">
              Full profile coming soon. Stay tuned.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BuilderPage
