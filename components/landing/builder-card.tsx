import Image from 'next/image'
import Link from 'next/link'

import type { Builder } from '@lib/builders/data'

interface BuilderCardProps {
  builder: Builder
  index: number
}

export const BuilderCard = ({ builder, index }: BuilderCardProps) => {
  return (
    <Link
      href={`/builders/${builder.slug}`}
      className="group relative aspect-[3/4] overflow-hidden transition-all duration-300 hover:z-10 hover:shadow-[0_0_24px_rgba(255,95,31,0.25)]"
      style={{ transitionDelay: `${(index % 6) * 50}ms` }}
    >
      {/* Background: real photo or gradient placeholder */}
      {builder.image ? (
        <Image
          src={builder.image}
          alt={builder.name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16.6vw"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${builder.gradientFrom}, ${builder.gradientTo})`,
          }}
        />
      )}

      {/* Subtle vignette for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

      {/* Initials (shown on gradient placeholders only) */}
      {!builder.image && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-syne text-2xl font-bold text-tag-text/40">{builder.initials}</span>
        </div>
      )}

      {/* Hover label */}
      <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/80 to-transparent px-2 pb-2 pt-6 transition-transform duration-300 group-hover:translate-y-0">
        <p className="font-grotesk text-xs font-medium text-tag-text">{builder.name}</p>
        <p className="font-grotesk text-[10px] text-tag-muted">{builder.role}</p>
      </div>
    </Link>
  )
}
