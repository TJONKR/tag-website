'use client'

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
        <div className="mt-6 flex items-center gap-4">
          <a
            href="#"
            className="whitespace-nowrap bg-tag-orange px-12 py-5 font-grotesk text-lg font-medium text-tag-bg-deep transition-colors hover:bg-[#e8551b]"
          >
            Apply &rarr;
          </a>
          <span className="whitespace-nowrap font-mono text-[11px] text-tag-dim">
            Amsterdam &middot; A Lab &middot; Every Thursday
          </span>
        </div>
      </div>
    </section>
  )
}
