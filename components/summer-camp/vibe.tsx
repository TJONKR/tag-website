import { CampSection, CampHeading } from './section';

const LINES = [
  {
    lead: 'Together beats alone.',
    body: 'Validation from your team, from the group, from the market. In that order, fast.',
  },
  {
    lead: 'Revenue is the scoreboard.',
    body: 'Who gets there first? Who gets the most? Friendly stakes, real money.',
  },
  {
    lead: 'Traction gets rewarded.',
    body: 'Hit your numbers and we push harder: more visibility, more intros, more help.',
  },
  {
    lead: 'Summer is the deadline.',
    body: 'Everyone else is on a beach towel. You’re launching a company. September will show the difference.',
  },
];

export const Vibe = () => {
  return (
    <CampSection label="What it feels like">
      <CampHeading>
        A pressure cooker.
        <br />
        <span className="text-tag-orange">Good vibes included.</span>
      </CampHeading>
      <div className="mt-2 max-w-[720px]">
        {LINES.map((line) => (
          <p
            key={line.lead}
            className="reveal border-b border-tag-border py-5 font-grotesk text-[19px] leading-relaxed text-tag-muted last:border-b-0"
          >
            <strong className="font-bold text-tag-text">{line.lead}</strong> {line.body}
          </p>
        ))}
      </div>
    </CampSection>
  );
};
