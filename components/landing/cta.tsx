'use client'

import Link from 'next/link'

import { useScrollReveal } from '@hooks/use-scroll-reveal'

export const Cta = () => {
  const ref = useScrollReveal()

  return (
    <section
      ref={ref}
      className="scanlines relative flex h-screen flex-col justify-end overflow-hidden bg-tag-bg-deep p-[60px] max-md:p-8"
    >
      {/* Decorative arrow */}
      <div className="absolute right-[60px] top-[60px] z-[1] select-none font-syne text-[200px] leading-none text-tag-border">
        &rarr;
      </div>

      {/* Content */}
      <div className="reveal relative z-[2]">
        <div className="font-syne text-[clamp(80px,12vw,140px)] leading-[0.9] text-tag-text">
          TAG IN.
        </div>
        <p className="mt-4 max-w-[600px] font-grotesk text-lg leading-relaxed text-tag-muted">
          Europe has the talent. What we&apos;re missing is the irrational belief that we deserve to
          win. This is where that belief starts.
        </p>
        <div className="mt-6 flex items-center gap-4">
          <Link
            href="/join"
            className="whitespace-nowrap bg-tag-orange px-12 py-5 font-grotesk text-lg font-medium text-tag-bg-deep transition-colors hover:bg-[#e8551b]"
          >
            Apply &rarr;
          </Link>
          <span className="whitespace-nowrap font-mono text-[11px] text-tag-dim">
            Amsterdam &middot; A Lab &middot; Every Thursday
          </span>
        </div>
      </div>
    </section>
  )
}
