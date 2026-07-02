const STRIP = (
  <span className="flex shrink-0 items-center gap-12 pr-12">
    {['Launch', 'Validate', 'Revenue', 'Repeat'].map((word) => (
      <span key={word} className="flex items-center gap-12">
        {word} <b className="font-normal text-tag-orange">//</b>
      </span>
    ))}
  </span>
);

export const CampMarquee = () => {
  return (
    <div className="overflow-hidden border-y border-tag-border bg-tag-bg py-4">
      <div
        className="flex w-max font-mono text-[13px] uppercase tracking-[0.25em] text-tag-muted"
        style={{ animation: 'marquee-scroll 28s linear infinite' }}
      >
        {STRIP}
        {STRIP}
        {STRIP}
        {STRIP}
      </div>
    </div>
  );
};
