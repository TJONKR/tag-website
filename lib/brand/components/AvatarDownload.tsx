import { Download } from 'lucide-react'
import Image from 'next/image'

const downloadClass =
  'inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-tag-border bg-transparent px-6 font-mono text-[11px] uppercase tracking-[0.08em] text-tag-text transition-colors hover:border-tag-dim hover:bg-tag-bg-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-tag-orange focus-visible:ring-offset-2 focus-visible:ring-offset-tag-bg'

export const AvatarDownload = () => {
  return (
    <div className="flex w-full max-w-[280px] flex-col gap-4">
      <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-md border border-tag-border bg-tag-bg-deep">
        <Image
          src="/images/tag-logo.png"
          alt="TAG avatar"
          width={280}
          height={280}
          className="size-full object-contain"
          unoptimized
        />
      </div>

      <a href="/images/tag-logo.png" download="tag-avatar.png" className={downloadClass}>
        <Download className="size-3.5" />
        Download
      </a>
    </div>
  )
}
