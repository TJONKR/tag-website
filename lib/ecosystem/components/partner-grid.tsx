import { Badge } from '@components/ui/badge'
import { partners } from '@lib/ecosystem/data'

export const PartnerGrid = () => {
  return (
    <section className="px-[60px] py-24 max-md:px-8">
      <div className="mx-auto max-w-[1440px]">
      <div className="grid grid-cols-3 gap-6 max-md:grid-cols-1">
        {partners.map((partner) => (
          <div
            key={partner.name}
            className="border border-tag-border bg-tag-card p-8"
          >
            <div className="flex items-center gap-3">
              <h3 className="font-syne text-xl font-bold text-tag-text">
                {partner.name}
              </h3>
              <Badge
                variant="outline"
                className="font-mono text-xs text-tag-muted"
              >
                {partner.type}
              </Badge>
            </div>
            <p className="mt-4 font-grotesk text-sm leading-relaxed text-tag-muted">
              {partner.description}
            </p>
            {partner.url && (
              <a
                href={partner.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block font-mono text-sm text-tag-orange hover:underline"
              >
                {partner.url.replace('https://', '')} &rarr;
              </a>
            )}
          </div>
        ))}
      </div>

      {/* For Partners CTA */}
      <div className="mt-24 border-t border-tag-border py-16 text-center">
        <h2 className="font-syne text-2xl font-bold text-tag-text">
          Want to partner with TAG?
        </h2>
        <p className="mt-2 font-grotesk text-tag-muted">
          We&rsquo;re always looking for funds, programs, and organizations who believe in builders.
        </p>
        <a
          href="mailto:hello@tag.community"
          className="mt-6 inline-block font-mono text-tag-orange hover:underline"
        >
          Get in touch &rarr;
        </a>
      </div>
      </div>
    </section>
  )
}
