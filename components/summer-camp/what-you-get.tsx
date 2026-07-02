import { CampSection, CampHeading, CampBody } from './section';

const LOOT = [
  {
    num: '01',
    title: 'The content machine',
    body: 'The machine that ran the MEGATHON campaign runs all summer, pointed at your startup. Get featured, get eyes, get validated faster.',
    hot: true,
  },
  {
    num: '02',
    title: 'A desk at TAG',
    body: 'Your spot in the space, through the camp and beyond, surrounded by people doing exactly what you’re doing. No empty-apartment energy.',
  },
  {
    num: '03',
    title: 'Free tokens & gear',
    body: 'AI credits and tooling to build fast. Your stack is covered. You bring the idea and the hours.',
  },
  {
    num: '04',
    title: 'Experts, on call',
    body: 'People who’ve validated, launched and sold before: there when you’re stuck, not lecturing when you’re not.',
  },
  {
    num: '05',
    title: 'The co-founder you’re missing',
    body: 'Nobody builds alone here. Come with a team or find one at kickoff: people who hold you accountable when motivation dips.',
  },
  {
    num: '06',
    title: 'Demo Day',
    body: 'End the summer pitching your numbers to a serious jury: founders, CTOs and VCs from the TAG network. You work toward a room that matters.',
  },
];

export const WhatYouGet = () => {
  return (
    <CampSection label="What you get">
      <CampHeading>
        Incubation.
        <br />
        <span className="text-tag-orange">Without the program.</span>
      </CampHeading>
      <CampBody>
        You apply, you get everything around the work: the environment, the commitment, the
        accountability, the people, and <strong>eyes on what you build</strong>. Building is cheap
        now. Attention and momentum are the expensive part.
      </CampBody>
      <div className="mt-12 grid grid-cols-3 gap-3.5 max-lg:grid-cols-2 max-md:grid-cols-1">
        {LOOT.map((item, i) => (
          <div
            key={item.num}
            className={`reveal-scale relative border bg-tag-card p-7 ${
              item.hot ? 'border-tag-orange' : 'border-tag-border'
            }`}
            style={{ transitionDelay: `${i * 80}ms` }}
          >
            {item.hot && (
              <span className="absolute -top-2.5 right-4 bg-tag-orange px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-tag-bg-deep">
                Main drop
              </span>
            )}
            <span
              className={`mb-4 block font-mono text-xs ${item.hot ? 'text-tag-orange' : 'text-tag-dim'}`}
            >
              {item.num}
            </span>
            <h3 className="mb-2.5 font-syne text-[19px] font-bold text-tag-text">{item.title}</h3>
            <p className="font-grotesk text-[15px] leading-relaxed text-tag-muted">{item.body}</p>
          </div>
        ))}
      </div>
    </CampSection>
  );
};
