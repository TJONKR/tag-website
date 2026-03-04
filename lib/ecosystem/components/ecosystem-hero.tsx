export const EcosystemHero = () => {
  return (
    <section className="relative overflow-hidden border-b border-tag-border">
      {/* Background image from program card */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(/images/program-ecosystem.jpg)' }}
      />
      <div className="absolute inset-0 bg-tag-bg/70" />

      <div className="relative z-10 px-[60px] py-24 max-md:px-8">
        <h1 className="font-syne text-[clamp(64px,10vw,120px)] leading-none text-tag-text">
          ECOSYSTEM
        </h1>
        <p className="mt-6 max-w-[500px] font-grotesk text-lg text-tag-muted">
          You fund companies. We cultivate the people who start them.
        </p>
      </div>
    </section>
  )
}
