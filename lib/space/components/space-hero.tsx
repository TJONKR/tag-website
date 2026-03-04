export const SpaceHero = () => {
  return (
    <section className="relative overflow-hidden border-b border-tag-border">
      {/* Background image from program card */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(/images/program-space.png)' }}
      />
      <div className="absolute inset-0 bg-tag-bg/70" />

      <div className="relative z-10 px-[60px] py-24 max-md:px-8">
        <h1 className="font-syne text-[clamp(64px,10vw,120px)] leading-none text-tag-text">
          THE SPACE
        </h1>
        <p className="mt-6 max-w-[500px] font-grotesk text-lg leading-relaxed text-tag-muted">
          Not a coworking space. A permanent workshop for people who build.
        </p>
      </div>
    </section>
  )
}
