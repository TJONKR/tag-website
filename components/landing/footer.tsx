import Link from 'next/link'

const footerLinks = [
  { label: 'Space', href: '/space' },
  { label: 'Events', href: '/events' },
  { label: 'Ecosystem', href: '/ecosystem' },
  { label: 'Join', href: '/join' },
]

export const Footer = () => {
  return (
    <footer className="border-t-[3px] border-tag-border bg-tag-bg-deep">
      {/* Row 1: Logo + Year */}
      <div className="px-[60px] py-6 max-md:px-8">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between">
          <div className="font-syne text-xl text-tag-text">TAG</div>
          <div className="font-mono text-[11px] text-tag-dim">2026</div>
        </div>
      </div>

      {/* Row 2: Nav links */}
      <div className="border-t border-tag-border px-[60px] py-4 max-md:px-8">
        <div className="mx-auto flex max-w-[1440px] items-center gap-6">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-mono text-[11px] uppercase tracking-[0.08em] text-tag-dim transition-colors hover:text-tag-text"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Row 3: Socials + Location */}
      <div className="border-t border-tag-border px-[60px] py-4 max-md:px-8">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between">
        <div className="flex gap-2">
          {/* X (Twitter) */}
          <a
            href="https://x.com/tageuamsterdam"
            className="inline-flex size-6 items-center justify-center rounded-full border border-tag-border transition-colors hover:border-tag-dim"
            aria-label="X"
          >
            <svg viewBox="0 0 24 24" className="size-2.5 fill-tag-dim">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>

          {/* LinkedIn */}
          <a
            href="https://www.linkedin.com/company/tag-eu/"
            className="inline-flex size-6 items-center justify-center rounded-full border border-tag-border transition-colors hover:border-tag-dim"
            aria-label="LinkedIn"
          >
            <svg viewBox="0 0 24 24" className="size-2.5 fill-tag-dim">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </a>

        </div>

        <a
          href="https://maps.app.goo.gl/9zKGeVW2krPQwcNC6"
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[11px] text-tag-dim transition-colors hover:text-tag-orange"
        >
          Jacob Bontiusplaats 9, 1018 LL Amsterdam
        </a>
        </div>
      </div>
    </footer>
  )
}
