export const HeroVideo = () => {
  return (
    <section className="relative h-screen w-full overflow-hidden bg-tag-bg-deep">
      {/* Video */}
      <video
        className="absolute inset-0 size-full object-cover"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/video/tag-video.mp4" type="video/mp4" />
      </video>

      {/* Gradient overlay */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            'linear-gradient(to bottom, rgba(14,13,11,0.15) 0%, rgba(14,13,11,0.4) 50%, rgba(14,13,11,0.85) 100%)',
        }}
      />

      {/* Grain overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-[2] opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />

      {/* Corner labels */}
      <span className="absolute left-[60px] top-6 z-[5] font-mono text-[11px] uppercase tracking-wider text-tag-dim max-md:left-6">
        AMSTERDAM
      </span>
      <span className="absolute right-[60px] top-6 z-[5] font-mono text-[11px] uppercase tracking-wider text-tag-dim max-md:right-6">
        EST. 2024
      </span>

      {/* Hero content */}
      <div className="absolute inset-0 z-[3] flex flex-col justify-end p-[60px] max-md:p-8">
        <div className="font-syne text-[clamp(80px,10vw,140px)] leading-[0.9] tracking-[-0.02em] text-tag-text">
          TAG
        </div>
        <div className="mt-3 font-mono text-sm uppercase tracking-wider text-tag-muted">
          To Achieve Greatness
        </div>
      </div>

      {/* Marquee ticker */}
      <div className="absolute bottom-1.5 left-0 z-[4] w-full overflow-hidden">
        <div
          className="flex w-max"
          style={{ animation: 'marquee-scroll 20s linear infinite' }}
        >
          <span className="whitespace-nowrap font-mono text-xs uppercase tracking-wider text-tag-border/60">
            THINK &middot; BUILD &middot; SHIP &middot; REPEAT &middot; THINK &middot; BUILD
            &middot; SHIP &middot; REPEAT &middot; THINK &middot; BUILD &middot; SHIP &middot;
            REPEAT &middot; THINK &middot; BUILD &middot; SHIP &middot; REPEAT &middot; THINK
            &middot; BUILD &middot; SHIP &middot; REPEAT &middot; THINK &middot; BUILD &middot;
            SHIP &middot; REPEAT &middot; THINK &middot; BUILD &middot; SHIP &middot; REPEAT
            &middot; THINK &middot; BUILD &middot; SHIP &middot; REPEAT &middot;&nbsp;
          </span>
          <span className="whitespace-nowrap font-mono text-xs uppercase tracking-wider text-tag-border/60">
            THINK &middot; BUILD &middot; SHIP &middot; REPEAT &middot; THINK &middot; BUILD
            &middot; SHIP &middot; REPEAT &middot; THINK &middot; BUILD &middot; SHIP &middot;
            REPEAT &middot; THINK &middot; BUILD &middot; SHIP &middot; REPEAT &middot; THINK
            &middot; BUILD &middot; SHIP &middot; REPEAT &middot; THINK &middot; BUILD &middot;
            SHIP &middot; REPEAT &middot; THINK &middot; BUILD &middot; SHIP &middot; REPEAT
            &middot; THINK &middot; BUILD &middot; SHIP &middot; REPEAT &middot;&nbsp;
          </span>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-6 left-1/2 z-[5] -translate-x-1/2 font-mono text-[11px] text-tag-dim"
        style={{ animation: 'scroll-pulse 2s ease-in-out infinite' }}
      >
        scroll
      </div>
    </section>
  )
}
