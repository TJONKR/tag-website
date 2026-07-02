'use client';

import Link from 'next/link';

import { useScrollReveal } from '@hooks/use-scroll-reveal';
import { DotGrid } from '@components/landing/dot-grid';

export const FinalCta = () => {
  const ref = useScrollReveal();

  return (
    <section
      ref={ref}
      id="apply"
      className="relative overflow-hidden border-t border-tag-border bg-tag-bg-deep px-16 py-36 text-center max-md:px-6 max-md:py-20"
      style={{ cursor: 'crosshair' }}
    >
      {/* Interactive dot grid, click for pulses */}
      <DotGrid />

      <div className="pointer-events-none relative z-[2] mx-auto w-full max-w-[1080px]">
        <span className="mb-5 block font-mono text-xs uppercase tracking-[0.22em] text-tag-orange">
          Applications open
        </span>
        <h2 className="reveal mx-auto mb-6 max-w-[760px] font-syne text-[clamp(30px,4.6vw,52px)] font-extrabold uppercase leading-[1.05] text-tag-text">
          Summer is six weeks long.
          <br />
          What do you have <span className="text-tag-orange">in September?</span>
        </h2>
        <p className="reveal mx-auto mb-11 max-w-[620px] font-grotesk text-lg leading-relaxed text-tag-muted">
          Apply solo or as a team. 30 spots. It&apos;s a physical space, not a webinar.
        </p>
        <div className="reveal flex justify-center">
          <Link
            href="/summer-camp/apply"
            className="pointer-events-auto whitespace-nowrap bg-tag-orange px-12 py-5 font-grotesk text-lg font-medium text-tag-bg-deep transition-colors hover:bg-[#e8551b]"
          >
            TAG in &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
};
