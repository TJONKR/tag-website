'use client'

import { useScrollReveal } from '@hooks/use-scroll-reveal'

export const Quote = () => {
  const ref = useScrollReveal()

  return (
    <section
      ref={ref}
      className="scanlines relative flex h-screen items-center justify-center bg-tag-bg-deep"
    >
      <h2 className="reveal z-[2] max-w-[90%] text-center font-syne text-[clamp(48px,9vw,120px)] leading-[1.1] text-tag-dim">
        WHERE THE{' '}
        <span
          className="text-tag-orange"
          style={{ animation: 'energy-pulse 2s ease-in-out infinite alternate' }}
        >
          ENERGY
        </span>{' '}
        IS.
      </h2>
    </section>
  )
}
