'use client';

import { useScrollReveal } from '@hooks/use-scroll-reveal';

import { CampHeading, CampBody } from './section';

interface Milestone {
  date: string;
  title: string;
  body: string;
  state: 'live' | 'default' | 'finale';
}

const MILESTONES: Milestone[] = [
  {
    date: 'Now',
    title: 'Applications open',
    body: 'Apply with your startup, your idea, or just yourself.',
    state: 'live',
  },
  {
    date: 'Jul 24',
    title: 'Applications close',
    body: 'Teams locked. No late entries. It’s a season, not a subscription.',
    state: 'default',
  },
  {
    date: 'Jul 27',
    title: 'Kickoff: day one',
    body: 'Camp starts. Ideas cut small, targets set, first calls made the same week.',
    state: 'default',
  },
  {
    date: 'Sep 4',
    title: 'Demo Day',
    body: 'Six weeks later: show your numbers to the room. Then the party.',
    state: 'finale',
  },
];

export const Schedule = () => {
  const ref = useScrollReveal();

  return (
    <section ref={ref} className="border-t border-tag-border px-16 py-28 max-md:px-6 max-md:py-16">
      <div className="mx-auto w-full max-w-[1080px]">
        <span className="mb-5 block font-mono text-xs uppercase tracking-[0.22em] text-tag-orange">
          The schedule
        </span>
        <CampHeading>
          One season. <span className="text-tag-orange">Hard dates.</span>
        </CampHeading>
        <CampBody>
          Sign up now, kick off July 27, ship by September 4. There is no next cohort planned. This
          is <strong>the</strong> summer one. And it&apos;s capped: <strong>30 spots.</strong>{' '}
          Quality over quantity.
        </CampBody>

        {/* Desktop: horizontal rail */}
        <div className="relative mt-16 max-md:hidden">
          <div className="absolute left-0 right-0 top-[5px] h-px bg-tag-border" />
          <div className="grid grid-cols-4 gap-5">
            {MILESTONES.map((m, i) => (
              <div
                key={m.date}
                className="reveal relative"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <span className="relative block size-[11px]">
                  {m.state === 'live' && (
                    <span className="absolute inset-0 animate-ping rounded-full bg-tag-orange/60" />
                  )}
                  <span
                    className={`absolute inset-0 rounded-full ${
                      m.state === 'default' ? 'bg-tag-border' : 'bg-tag-orange'
                    }`}
                  />
                </span>
                <div
                  className={`mt-5 font-mono text-xs uppercase tracking-[0.2em] ${
                    m.state === 'default' ? 'text-tag-muted' : 'text-tag-orange'
                  }`}
                >
                  {m.date}
                </div>
                <h3 className="mt-2 font-syne text-[17px] font-bold text-tag-text">{m.title}</h3>
                <p className="mt-2 font-grotesk text-[14px] leading-relaxed text-tag-muted">
                  {m.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile: vertical rail */}
        <div className="relative mt-12 hidden max-md:block">
          <div className="absolute bottom-2 left-[5px] top-2 w-px bg-tag-border" />
          <div className="flex flex-col gap-9">
            {MILESTONES.map((m) => (
              <div key={m.date} className="reveal relative pl-8">
                <span className="absolute left-0 top-1.5 block size-[11px]">
                  {m.state === 'live' && (
                    <span className="absolute inset-0 animate-ping rounded-full bg-tag-orange/60" />
                  )}
                  <span
                    className={`absolute inset-0 rounded-full ${
                      m.state === 'default' ? 'bg-tag-border' : 'bg-tag-orange'
                    }`}
                  />
                </span>
                <div
                  className={`font-mono text-xs uppercase tracking-[0.2em] ${
                    m.state === 'default' ? 'text-tag-muted' : 'text-tag-orange'
                  }`}
                >
                  {m.date}
                </div>
                <h3 className="mt-1 font-syne text-[17px] font-bold text-tag-text">{m.title}</h3>
                <p className="mt-1 font-grotesk text-[14px] leading-relaxed text-tag-muted">
                  {m.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly rhythm during the camp */}
        <div className="mt-16 grid grid-cols-3 gap-3.5 max-md:mt-12 max-md:grid-cols-1">
          <div className="reveal border border-tag-border bg-tag-card p-6">
            <span className="mb-2 block font-mono text-[11px] uppercase tracking-[0.2em] text-tag-orange">
              Every Friday
            </span>
            <p className="font-grotesk text-[15px] leading-relaxed text-tag-muted">
              Progress round. Every team shows where it stands, including us. Leaderboard gets
              updated, pivots get decided.
            </p>
          </div>
          <div className="reveal border border-tag-border bg-tag-card p-6">
            <span className="mb-2 block font-mono text-[11px] uppercase tracking-[0.2em] text-tag-orange">
              On the fly
            </span>
            <p className="font-grotesk text-[15px] leading-relaxed text-tag-muted">
              Expert workshops when experts land: validation, pitching, pricing. Run by the experts
              themselves. Join if it helps, skip if you&apos;re shipping.
            </p>
          </div>
          <div className="reveal border border-tag-border bg-tag-card p-6">
            <span className="mb-2 block font-mono text-[11px] uppercase tracking-[0.2em] text-tag-orange">
              All summer
            </span>
            <p className="font-grotesk text-[15px] leading-relaxed text-tag-muted">
              The content machine and sponsor tokens run in the background. You build, the ecosystem
              works for you.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
