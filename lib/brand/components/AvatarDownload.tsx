import Image from 'next/image'

const downloadClass =
  'inline-flex h-11 items-center justify-center rounded-md px-6 font-mono text-[11px] uppercase tracking-[0.08em] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-tag-orange focus-visible:ring-offset-2 focus-visible:ring-offset-tag-bg'

export const AvatarDownload = () => {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex aspect-square w-full max-w-[280px] items-center justify-center overflow-hidden rounded-md border border-tag-border bg-tag-bg-deep">
        <Image
          src="/images/tag-logo.png"
          alt="TAG avatar"
          width={280}
          height={280}
          className="h-full w-full object-contain"
          unoptimized
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <a
          href="/images/tag-logo.png"
          download="tag-avatar.png"
          className={`${downloadClass} bg-tag-orange text-tag-bg-deep hover:bg-tag-orange/90`}
        >
          PNG
        </a>
      </div>
    </div>
  )
}
