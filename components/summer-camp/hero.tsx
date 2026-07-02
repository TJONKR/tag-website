'use client';

import { useEffect, useState } from 'react';

const LINES = [
  'you never go back to your corporate job.',
  "you're done with consultancy gigs. For good.",
  'your own app is making money.',
  'you’re a founder. Not “aspiring”. Founder.',
  'you built something people actually pay for.',
];

const ROTATE_MS = 2600;

export const CampHero = () => {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), ROTATE_MS);
    return () => clearInterval(id);
  }, []);

  const current = tick % LINES.length;
  const previous = tick > 0 ? (tick - 1) % LINES.length : -1;

  return (
    <section className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-tag-bg-deep px-16 py-24 max-md:px-6 max-md:py-16">
      {/* Video background */}
      <video className="absolute inset-0 size-full object-cover" autoPlay muted loop playsInline>
        <source src="/video/tag-video.mp4" type="video/mp4" />
      </video>

      {/* Gradient overlay, heavier than homepage so type stays readable */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            'linear-gradient(to bottom, rgba(14,13,11,0.75) 0%, rgba(14,13,11,0.82) 55%, rgba(14,13,11,0.95) 100%)',
        }}
      />

      {/* Grain overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-[2] opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />

      {/* Corner labels */}
      <span className="absolute left-[60px] top-20 z-[5] font-mono text-[11px] uppercase tracking-wider text-tag-muted max-md:left-6">
        AMSTERDAM
      </span>
      <span className="absolute right-[60px] top-20 z-[5] font-mono text-[11px] uppercase tracking-wider text-tag-muted max-md:right-6">
        SUMMER 2026
      </span>

      <div className="relative z-[3] mx-auto w-full max-w-[1080px]">
        <div className="mb-7 font-mono text-xs uppercase tracking-[0.22em] text-tag-orange">
          A TAG event &middot; Six weeks &middot; Summer 2026 &middot; Amsterdam
        </div>

        <h1 className="mb-10 font-syne text-[clamp(52px,10vw,128px)] font-extrabold uppercase leading-[0.92] tracking-[-0.01em] text-tag-text">
          Startup
          <br />
          Summer <span className="text-tag-orange">Camp</span>
        </h1>

        <div className="mb-12 min-h-[2.6em] font-grotesk text-[clamp(19px,2.6vw,28px)] font-medium text-tag-muted">
          <span className="text-tag-text">What if, after this summer,</span>
          <span className="relative block h-[1.55em] overflow-hidden">
            {LINES.map((line, i) => (
              <span
                key={line}
                className={`duration-[450ms] ease-[cubic-bezier(0.16,1,0.3,1)] absolute left-0 top-0 whitespace-nowrap font-bold text-tag-orange transition-[transform,opacity] max-md:whitespace-normal max-md:text-[0.85em] ${
                  i === current
                    ? 'translate-y-0 opacity-100'
                    : i === previous
                      ? '-translate-y-[110%] opacity-0'
                      : 'translate-y-[110%] opacity-0'
                }`}
              >
                {line}
              </span>
            ))}
          </span>
        </div>

        <div className="flex flex-wrap gap-3.5">
          <a
            href="/summer-camp/apply"
            className="whitespace-nowrap bg-tag-orange px-12 py-5 font-grotesk text-lg font-medium text-tag-bg-deep transition-colors hover:bg-[#e8551b]"
          >
            Apply &rarr;
          </a>
          <a
            href="#what"
            className="whitespace-nowrap border border-tag-border px-12 py-5 font-grotesk text-lg font-medium text-tag-text transition-colors hover:border-tag-orange hover:text-tag-orange"
          >
            What is this?
          </a>
        </div>

        <p className="mt-6 font-grotesk text-[15px] text-tag-dim">
          No startup yet? Apply with an idea, or with nothing but the itch.{' '}
          <strong className="font-medium text-[#ffb347]">
            We ask commitment, not credentials.
          </strong>
        </p>
      </div>
    </section>
  );
};
