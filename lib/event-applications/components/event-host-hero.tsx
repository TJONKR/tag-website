export const EventHostHero = () => {
  return (
    <section className="w-full px-[60px] py-24 max-md:px-8">
      <div className="mx-auto max-w-[1440px]">
        <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-tag-orange">
          Host at TAG
        </p>
        <h1 className="mt-4 font-syne text-[clamp(56px,9vw,104px)] font-bold leading-none text-tag-text">
          BRING YOUR EVENT.
        </h1>
        <p className="mt-6 max-w-[640px] font-grotesk text-lg text-tag-muted">
          TAG is a space in Amsterdam built for builders. We host talks,
          workshops, meetups, hackathons, and launches that match the room&apos;s
          energy. Tell us what you want to run — we&apos;ll read every request
          and get back to you personally.
        </p>
        <p className="mt-4 max-w-[640px] font-grotesk text-sm text-tag-dim">
          This form is for external hosts. If you&apos;re already part of TAG,
          post it in the community instead.
        </p>
      </div>
    </section>
  )
}
