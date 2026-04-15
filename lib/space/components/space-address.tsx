import { MapPin, ExternalLink } from 'lucide-react'

export const SpaceAddress = () => {
  return (
    <section className="border-t border-tag-border px-[60px] py-24 max-md:px-8">
      <div className="mx-auto max-w-[1440px]">
      <h2 className="mb-12 font-mono text-sm uppercase tracking-[0.08em] text-tag-muted">
        Location
      </h2>
      <div className="flex items-center justify-between gap-8 border border-tag-border p-8 max-md:flex-col max-md:items-start">
        <div className="flex items-center gap-5">
          <div className="flex size-12 items-center justify-center border border-tag-orange/30 bg-tag-orange/10">
            <MapPin className="size-5 text-tag-orange" />
          </div>
          <div>
            <h3 className="font-syne text-xl text-tag-text">TAG HQ</h3>
            <p className="mt-1 font-mono text-sm text-tag-muted">
              Jacob Bontiusplaats 9, 1018 LL Amsterdam
            </p>
          </div>
        </div>
        <a
          href="https://maps.app.goo.gl/9zKGeVW2krPQwcNC6"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 border border-tag-border px-5 py-3 font-mono text-[11px] uppercase tracking-wider text-tag-dim transition-colors hover:border-tag-orange hover:text-tag-orange"
        >
          Open in Maps
          <ExternalLink className="size-3" />
        </a>
      </div>
      </div>
    </section>
  )
}
