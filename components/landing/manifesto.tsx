'use client'

import { useScrollReveal } from '@hooks/use-scroll-reveal'

export const Manifesto = () => {
  const ref = useScrollReveal()

  return (
    <section
      ref={ref}
      className="flex min-h-[80vh] flex-col items-center justify-center bg-tag-bg px-16 py-24 text-center max-md:px-6 max-md:py-16"
    >
      <p className="reveal max-w-[640px] font-grotesk text-[clamp(20px,3vw,32px)] leading-[1.6] text-tag-text">
        For the <span className="text-tag-orange">obsessed</span>, creative and talented people
        who create. Every single day.
      </p>
      <hr className="reveal mx-auto my-10 h-[3px] w-12 border-none bg-tag-orange" />
      <p className="reveal max-w-[520px] font-grotesk text-lg leading-relaxed text-tag-muted">
        A community of builders, hackers, and creators in Amsterdam. We ship every month. We show
        what we built — then we do it again. Ship fast, learn faster, show your work.
      </p>
    </section>
  )
}
