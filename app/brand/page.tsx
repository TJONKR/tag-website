import type { Metadata } from 'next'

import { Footer, GrainOverlay } from '@components/landing'
import { AvatarDownload } from '@lib/brand/components/AvatarDownload'
import { BrandGuides } from '@lib/brand/components/BrandGuides'
import { ColorSwatch } from '@lib/brand/components/ColorSwatch'
import { LogoDownload } from '@lib/brand/components/LogoDownload'
import { TypeSpecimen } from '@lib/brand/components/TypeSpecimen'

export const metadata: Metadata = {
  title: 'Brand — TAG',
  description:
    'TAG brand guidelines, logo downloads, color palette, typography and voice. For partners, press and builders.',
}

const colors = [
  {
    name: 'TAG Orange',
    token: 'tag-orange',
    hex: '#ff5f1f',
    className: 'bg-tag-orange',
    textClass: 'text-tag-bg-deep',
  },
  {
    name: 'Background',
    token: 'tag-bg',
    hex: '#141210',
    className: 'bg-tag-bg',
  },
  {
    name: 'Background Deep',
    token: 'tag-bg-deep',
    hex: '#0e0d0b',
    className: 'bg-tag-bg-deep',
  },
  {
    name: 'Text',
    token: 'tag-text',
    hex: '#f0ebe3',
    className: 'bg-tag-text',
    textClass: 'text-tag-bg-deep',
  },
  {
    name: 'Muted',
    token: 'tag-muted',
    hex: '#9b9589',
    className: 'bg-tag-muted',
    textClass: 'text-tag-bg-deep',
  },
  {
    name: 'Dim',
    token: 'tag-dim',
    hex: '#5e5850',
    className: 'bg-tag-dim',
  },
  {
    name: 'Border',
    token: 'tag-border',
    hex: '#2a2724',
    className: 'bg-tag-border',
  },
]

const typeSpecs = [
  {
    name: 'Syne',
    role: 'Display',
    weights: '800',
    className: 'font-syne text-[clamp(48px,7vw,96px)] leading-[0.95]',
    sample: 'To Achieve Greatness',
  },
  {
    name: 'Space Grotesk',
    role: 'Body',
    weights: '400 / 500 / 600',
    className: 'font-grotesk text-xl leading-[1.6]',
    sample:
      'A community of builders, hackers, and creators in Amsterdam. We ship every month — then we do it again.',
  },
  {
    name: 'Space Mono',
    role: 'Mono / labels',
    weights: '400 / 700',
    className: 'font-mono text-base leading-[1.6]',
    sample: 'EVENTS · SPACE · ECOSYSTEM · JOIN',
  },
]

export default function BrandPage() {
  return (
    <>
      <GrainOverlay />
      <BrandGuides />
      <main className="relative bg-transparent">
        {/* Hero */}
        <section className="border-b border-tag-border bg-tag-bg-deep px-16 pb-16 pt-32 max-md:px-6 max-md:pt-24">
          <div className="mx-auto flex max-w-[1200px] flex-col gap-6">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-tag-orange">
              Brand kit
            </span>
            <h1 className="font-syne text-[clamp(56px,9vw,128px)] leading-[0.9] text-tag-text">
              Brand guidelines
            </h1>
            <p className="max-w-[640px] font-grotesk text-lg leading-relaxed text-tag-muted">
              Everything you need to talk about TAG — logo, colors, type and how we sound. For
              partners, press and builders.
            </p>
          </div>
        </section>

        {/* Logo */}
        <section className="border-b border-tag-border px-16 py-24 max-md:px-6 max-md:py-16">
          <div className="mx-auto flex max-w-[1200px] flex-col gap-10">
            <header className="flex flex-col gap-2">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-tag-dim">
                01 — Logo
              </span>
              <h2 className="font-syne text-[clamp(32px,5vw,56px)] leading-[1] text-tag-text">
                Logo
              </h2>
              <p className="max-w-[560px] font-grotesk text-base text-tag-muted">
                Use the wordmark in full. Keep clearspace around it equal to the height of the T,
                and never recolor or stretch.
              </p>
            </header>
            <LogoDownload />
          </div>
        </section>

        {/* Avatar */}
        <section className="border-b border-tag-border px-16 py-24 max-md:px-6 max-md:py-16">
          <div className="mx-auto flex max-w-[1200px] flex-col gap-10">
            <header className="flex flex-col gap-2">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-tag-dim">
                02 — Avatar
              </span>
              <h2 className="font-syne text-[clamp(32px,5vw,56px)] leading-[1] text-tag-text">
                Avatar
              </h2>
              <p className="max-w-[560px] font-grotesk text-base text-tag-muted">
                The square mark for profile pictures and social avatars. Use as-is — keep the full
                frame and don&apos;t crop the wordmark.
              </p>
            </header>
            <AvatarDownload />
          </div>
        </section>

        {/* Colors */}
        <section className="border-b border-tag-border px-16 py-24 max-md:px-6 max-md:py-16">
          <div className="mx-auto flex max-w-[1200px] flex-col gap-10">
            <header className="flex flex-col gap-2">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-tag-dim">
                03 — Color
              </span>
              <h2 className="font-syne text-[clamp(32px,5vw,56px)] leading-[1] text-tag-text">
                Color palette
              </h2>
              <p className="max-w-[560px] font-grotesk text-base text-tag-muted">
                Orange is the accent — used sparingly. Everything else lives in warm dark neutrals.
                Tap any swatch to copy the hex.
              </p>
            </header>
            <div className="grid grid-cols-4 gap-4 max-lg:grid-cols-3 max-md:grid-cols-2">
              {colors.map((c) => (
                <ColorSwatch key={c.token} {...c} />
              ))}
            </div>
          </div>
        </section>

        {/* Typography */}
        <section className="border-b border-tag-border px-16 py-24 max-md:px-6 max-md:py-16">
          <div className="mx-auto flex max-w-[1200px] flex-col gap-10">
            <header className="flex flex-col gap-2">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-tag-dim">
                04 — Typography
              </span>
              <h2 className="font-syne text-[clamp(32px,5vw,56px)] leading-[1] text-tag-text">
                Typography
              </h2>
              <p className="max-w-[560px] font-grotesk text-base text-tag-muted">
                Three voices: Syne for display moments, Space Grotesk for everything readable,
                Space Mono for labels and small caps.
              </p>
            </header>
            <div className="flex flex-col gap-4">
              {typeSpecs.map((t) => (
                <TypeSpecimen key={t.name} {...t} />
              ))}
            </div>
          </div>
        </section>

        {/* Voice & tone */}
        <section className="border-b border-tag-border px-16 py-24 max-md:px-6 max-md:py-16">
          <div className="mx-auto flex max-w-[1200px] flex-col gap-10">
            <header className="flex flex-col gap-2">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-tag-dim">
                05 — Voice & tone
              </span>
              <h2 className="font-syne text-[clamp(32px,5vw,56px)] leading-[1] text-tag-text">
                How we sound
              </h2>
            </header>
            <div className="flex max-w-[720px] flex-col gap-6 font-grotesk text-lg leading-[1.7] text-tag-text">
              <p>
                Direct. We don&apos;t hedge. If something ships, we say it shipped. If something
                broke, we say it broke. Short sentences beat long ones.
              </p>
              <p>
                Builder-first. We talk to people who make things. Less marketing, more workshop.
                Concrete verbs over abstract nouns.
              </p>
              <p>
                Warm, not corporate.{' '}
                <span className="text-tag-orange">Obsessed</span>, creative, talented — the words we
                use for our people. We celebrate the work, not the titles.
              </p>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  )
}
