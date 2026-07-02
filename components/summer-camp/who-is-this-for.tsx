import { CampSection, CampHeading, CampBody } from './section';

const CARDS = [
  {
    title: 'You want to do startups.',
    confirm: "No product yet, maybe not even an idea. You're done watching other people launch.",
    help: (
      <>
        You get the kickoff, a team, and a clear first week:{' '}
        <strong>pick an idea, cut it small, test it on real people.</strong> No experience needed.
        That&apos;s the point.
      </>
    ),
  },
  {
    title: 'You have an idea and half a product.',
    confirm: 'You started. You never shipped. It’s been "almost ready" for months.',
    help: (
      <>
        Six weeks of deadlines and witnesses. We help you{' '}
        <strong>cut it down, ship it, and get it in front of real users</strong>. This summer, not
        someday.
      </>
    ),
  },
  {
    title: 'You shipped. Now it needs to grow.',
    confirm:
      'A live side project: zero revenue or the first euros in. You want to see how far it really goes.',
    help: (
      <>
        <strong>Traffic from our channels, pricing and positioning help,</strong> and a scoreboard
        that counts one thing: paying customers.
      </>
    ),
  },
  {
    title: 'You want to do this with people.',
    confirm:
      "You're building alone at your kitchen table. What's missing isn't skill. It's people.",
    help: (
      <>
        A summer at one table with founders like you.{' '}
        <strong>
          Shared momentum, shared lessons, and people who notice when you don&apos;t show up.
        </strong>
      </>
    ),
  },
];

const STRENGTHS = [
  {
    title: 'Why together',
    body: (
      <>
        Alone, your project loses to your calendar every time. In a group that shows up every week,
        it doesn&apos;t. <strong>We keep each other accountable.</strong> That includes us:
        we&apos;re building our own apps right here.
      </>
    ),
  },
  {
    title: 'Why at TAG',
    body: (
      <>
        A space full of builders who ship every month, an audience we point at your startup, and a
        network of people who&apos;ve done it before.{' '}
        <strong>You bring the hours. TAG brings the ecosystem.</strong>
      </>
    ),
  },
];

export const WhoIsThisFor = () => {
  return (
    <CampSection id="who" label="Who is this for">
      <CampHeading>
        Who is this <span className="text-tag-orange">for?</span>
      </CampHeading>
      <CampBody>
        Simple: anyone who wants in on startups. You want to build a product of your own, make your
        own money, and get the <strong>freedom to do whatever you want</strong> with your time.
        That&apos;s the whole filter.
      </CampBody>

      <span className="reveal mt-11 block font-mono text-xs uppercase tracking-[0.22em] text-tag-muted">
        You&apos;re either:
      </span>

      <div className="mt-7 grid grid-cols-2 gap-3.5 max-md:grid-cols-1">
        {CARDS.map((card, i) => (
          <div
            key={card.title}
            className="reveal-scale flex flex-col border border-tag-border bg-tag-card p-7"
            style={{ transitionDelay: `${i * 100}ms` }}
          >
            <h3 className="mb-3 font-syne text-[21px] font-bold leading-[1.25] text-tag-text">
              {card.title}
            </h3>
            <p className="mb-5 flex-1 font-grotesk text-[15px] leading-relaxed text-tag-muted">
              {card.confirm}
            </p>
            <div className="border-t border-tag-border pt-4 font-grotesk text-[14.5px] leading-relaxed text-tag-muted [&_strong]:font-medium [&_strong]:text-tag-text">
              <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.22em] text-tag-orange">
                How we help
              </span>
              {card.help}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3.5 grid grid-cols-2 gap-3.5 max-md:grid-cols-1">
        {STRENGTHS.map((s) => (
          <div key={s.title} className="reveal border border-tag-border bg-tag-bg-deep p-7">
            <h3 className="mb-2 font-syne text-[17px] font-bold text-[#ffb347]">{s.title}</h3>
            <p className="font-grotesk text-[15px] leading-relaxed text-tag-muted [&_strong]:font-medium [&_strong]:text-tag-text">
              {s.body}
            </p>
          </div>
        ))}
      </div>
    </CampSection>
  );
};
