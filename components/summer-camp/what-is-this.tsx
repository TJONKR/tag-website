import { CampSection, CampHeading, CampBody } from './section';

export const WhatIsThis = () => {
  return (
    <CampSection id="what" label="What is this about">
      <CampHeading>
        Six weeks at TAG.
        <br />
        One goal: <span className="text-tag-orange">money-making startups.</span>
      </CampHeading>
      <CampBody>
        A six-week event focused on launching startups, validating ideas against the real market,
        and learning to sell what you build. Not a course. Not an incubator. An event: a start, an
        end, a scoreboard, and real stakes.{' '}
        <strong>This is for people who commit. That&apos;s the whole ask.</strong>
      </CampBody>
      <div className="reveal mt-9 max-w-[620px] border border-tag-border bg-tag-card p-6">
        <span className="mb-2 block font-mono text-[11px] uppercase tracking-[0.22em] text-tag-orange">
          Full disclosure
        </span>
        <p className="mb-3 font-grotesk text-[17px] font-medium leading-relaxed text-tag-text">
          TAG sells office space. This campaign exists to fill it.
        </p>
        <p className="font-grotesk text-[15.5px] leading-relaxed text-tag-muted">
          We could have bought ads. Building is more fun. So this summer we&apos;re launching our
          own products, in a full office, with people who want the same.
        </p>
      </div>
      <p className="reveal mt-9 max-w-[700px] border-l-[3px] border-tag-orange pl-6 font-grotesk text-[clamp(20px,2.6vw,27px)] font-medium leading-[1.5] text-tag-text">
        We&apos;re not organizing this from the sidelines. We&apos;re launching our own apps right
        next to you.
      </p>
    </CampSection>
  );
};
