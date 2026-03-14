import { MapPin } from 'lucide-react'

export const SpaceAddress = () => {
  return (
    <section className="border-t border-tag-border px-[60px] py-24 max-md:px-8">
      <h2 className="mb-12 font-mono text-sm uppercase tracking-[0.08em] text-tag-muted">
        Location
      </h2>
      <div className="flex items-start gap-4">
        <div className="text-tag-orange">
          <MapPin className="size-5" />
        </div>
        <div>
          <h3 className="font-syne text-2xl text-tag-text">TAG HQ</h3>
          <p className="mt-2 text-sm leading-relaxed text-tag-muted">
            Jacob Bontiusplaats 9, 1018 LL Amsterdam
          </p>
        </div>
      </div>
    </section>
  )
}
