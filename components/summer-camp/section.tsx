'use client';

import { useScrollReveal } from '@hooks/use-scroll-reveal';

interface CampSectionProps {
  id?: string;
  label: string;
  children: React.ReactNode;
  className?: string;
}

export const CampSection = ({ id, label, children, className = '' }: CampSectionProps) => {
  const ref = useScrollReveal();

  return (
    <section
      ref={ref}
      id={id}
      className={`border-t border-tag-border px-16 py-28 first:border-t-0 max-md:px-6 max-md:py-16 ${className}`}
    >
      <div className="mx-auto w-full max-w-[1080px]">
        <span className="mb-5 block font-mono text-xs uppercase tracking-[0.22em] text-tag-orange">
          {label}
        </span>
        {children}
      </div>
    </section>
  );
};

export const CampHeading = ({ children }: { children: React.ReactNode }) => (
  <h2 className="reveal mb-7 max-w-[760px] font-syne text-[clamp(30px,4.6vw,52px)] font-extrabold uppercase leading-[1.05] text-tag-text">
    {children}
  </h2>
);

export const CampBody = ({ children }: { children: React.ReactNode }) => (
  <p className="reveal mb-4 max-w-[620px] font-grotesk text-lg leading-relaxed text-tag-muted [&_strong]:font-medium [&_strong]:text-tag-text">
    {children}
  </p>
);
