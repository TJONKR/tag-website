'use client';

import { useScrollReveal } from '@hooks/use-scroll-reveal';

import { CampHeading, CampBody } from './section';

const BEATS = [
  {
    number: '01',
    label: 'Apply',
    title: 'Get in',
    body: 'Solo or as a team, with your startup, your idea, or just yourself. Takes five minutes.',
    image: '/images/summer-camp/moment-garage.png',
    caption: 'Los Altos, 1976',
  },
  {
    number: '02',
    label: 'Kickoff',
    title: 'Lock it in',
    body: 'Form your team, cut your idea down to something launchable, set your targets.',
    image: '/images/summer-camp/moment-mafia.png',
    caption: 'The PayPal Mafia, 2007',
  },
  {
    number: '03',
    label: 'Weeks 1–6',
    title: 'Validate. Ship. Iterate.',
    body: 'Sell it before you build it, ship what survives, loop until the numbers move. One check-in a week, leaderboard on the wall.',
    image: '/images/summer-camp/moment-factory.png',
    caption: 'Fremont factory floor, 2018',
  },
  {
    number: '04',
    label: 'Demo Day',
    title: 'Show your numbers',
    body: 'Your product, your process, your revenue, in front of a room that matters.',
    image: '/images/summer-camp/moment-hello.png',
    caption: 'Macintosh says hello, 1984',
  },
];

export const HowItWorks = () => {
  const ref = useScrollReveal();

  return (
    <section ref={ref} className="border-t border-tag-border px-16 py-28 max-md:px-6 max-md:py-16">
      <div className="mx-auto w-full max-w-[1080px]">
        <span className="mb-5 block font-mono text-xs uppercase tracking-[0.22em] text-tag-orange">
          How it works
        </span>
        <CampHeading>
          Minimal program.
          <br />
          <span className="text-tag-orange">On purpose.</span>
        </CampHeading>
        <CampBody>
          We believe in autonomy and the accountability of a good group. We won&apos;t hold your
          hand. <strong>We will hold you accountable.</strong> Enough structure for the people who
          are going to make it. No busywork for anyone.
        </CampBody>

        <div className="mt-12 grid grid-cols-4 gap-3.5 max-lg:grid-cols-2 max-sm:grid-cols-1">
          {BEATS.map((beat, i) => (
            <div
              key={beat.number}
              className="reveal-scale group relative flex min-h-[400px] flex-col justify-between overflow-hidden border border-tag-border p-6 max-sm:min-h-[300px]"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              {/* Background image */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: `url(${beat.image})` }}
              />
              {/* Legibility gradient: image stays visible, text zone darkens */}
              <div className="absolute inset-0 bg-gradient-to-b from-tag-bg/25 via-tag-bg/20 to-tag-bg/90" />
              {/* Orange glow on hover */}
              <div className="absolute inset-0 opacity-0 shadow-[0_0_30px_rgba(255,95,31,0.15)_inset] transition-opacity duration-300 group-hover:opacity-100" />
              {/* Content */}
              <div className="relative z-10 flex items-baseline justify-between">
                <span className="font-syne text-[44px] font-bold leading-none text-tag-orange">
                  {beat.number}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-tag-muted">
                  {beat.label}
                </span>
              </div>
              <div className="relative z-10 mt-auto">
                <h3 className="mb-2 font-syne text-lg font-bold text-tag-text">{beat.title}</h3>
                <p className="font-grotesk text-sm leading-relaxed text-tag-text/75">{beat.body}</p>
                <div className="mt-4 border-t border-tag-text/10 pt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-tag-muted">
                  {beat.caption}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
