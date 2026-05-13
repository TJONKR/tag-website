import Image from 'next/image'

interface LogoTileProps {
  variant: 'dark' | 'light'
}

const LogoTile = ({ variant }: LogoTileProps) => {
  const isDark = variant === 'dark'
  const bg = isDark ? 'bg-tag-bg-deep' : 'bg-tag-text'
  const src = isDark ? '/brand/tag-logo-white.svg' : '/brand/tag-logo-black.svg'
  const label = isDark ? 'on dark' : 'on light'

  return (
    <div
      className={`flex aspect-[4/3] items-center justify-center rounded-md border border-tag-border p-12 ${bg}`}
    >
      <Image
        src={src}
        alt={`TAG logo ${label}`}
        width={234}
        height={48}
        className="h-auto w-full max-w-[280px] object-contain"
        priority
        unoptimized
      />
    </div>
  )
}

const downloadClass =
  'inline-flex h-11 items-center justify-center rounded-md px-6 font-mono text-[11px] uppercase tracking-[0.08em] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-tag-orange focus-visible:ring-offset-2 focus-visible:ring-offset-tag-bg'

interface DownloadLinkProps {
  href: string
  filename: string
  label: string
  primary?: boolean
}

const DownloadLink = ({ href, filename, label, primary }: DownloadLinkProps) => (
  <a
    href={href}
    download={filename}
    className={`${downloadClass} ${
      primary
        ? 'bg-tag-orange text-tag-bg-deep hover:bg-tag-orange/90'
        : 'border border-tag-border bg-transparent text-tag-text hover:border-tag-orange hover:text-tag-orange'
    }`}
  >
    {label}
  </a>
)

export const LogoDownload = () => {
  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
        <LogoTile variant="dark" />
        <LogoTile variant="light" />
      </div>

      <div className="flex flex-wrap gap-3">
        <DownloadLink
          href="/brand/tag-logo-white.svg"
          filename="tag-logo-white.svg"
          label="SVG · White"
          primary
        />
        <DownloadLink
          href="/brand/tag-logo-black.svg"
          filename="tag-logo-black.svg"
          label="SVG · Black"
          primary
        />
        <DownloadLink
          href="/images/tag-logo.png"
          filename="tag-logo.png"
          label="PNG"
        />
      </div>
    </div>
  )
}
