import Link from 'next/link'
import { Check } from 'lucide-react'

import { pricingTiers } from '@lib/space/data'

export const PricingTiers = () => {
  return (
    <section className="border-t border-tag-border px-[60px] py-24 max-md:px-8">
      <div className="mx-auto max-w-[1440px]">
      <h2 className="mb-12 font-mono text-sm uppercase tracking-[0.08em] text-tag-muted">
        Pricing
      </h2>
      <div className="grid grid-cols-3 gap-6 max-md:grid-cols-1">
        {pricingTiers.map((tier) => (
          <div
            key={tier.name}
            className={`relative flex flex-col bg-tag-card border p-8 ${
              tier.highlighted ? 'border-tag-orange' : 'border-tag-border'
            }`}
          >
            {tier.highlighted && (
              <span className="absolute right-4 top-4 bg-tag-orange px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-tag-bg-deep">
                Most Popular
              </span>
            )}
            <h3 className="font-syne text-2xl text-tag-text">{tier.name}</h3>
            <p className="mt-2 text-sm text-tag-muted">{tier.description}</p>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="font-syne text-[clamp(36px,5vw,48px)] leading-none text-tag-orange">
                {tier.price}
              </span>
              <span className="font-mono text-sm text-tag-dim">{tier.period}</span>
            </div>
            <ul className="mt-8 flex flex-col gap-3">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <Check className="size-4 shrink-0 text-tag-orange" />
                  <span className="text-sm text-tag-text">{feature}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/join"
              className="mt-8 block border border-tag-border bg-tag-bg px-6 py-3 text-center font-mono text-sm text-tag-text transition-colors hover:border-tag-orange hover:text-tag-orange"
            >
              Tag In &rarr;
            </Link>
          </div>
        ))}
      </div>
      </div>
    </section>
  )
}
