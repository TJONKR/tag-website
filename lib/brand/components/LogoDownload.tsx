'use client'

import { Download } from 'lucide-react'
import Image from 'next/image'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu'

const triggerClass =
  'inline-flex h-11 items-center justify-center gap-2 rounded-md border border-tag-border bg-transparent px-6 font-mono text-[11px] uppercase tracking-[0.08em] text-tag-text transition-colors hover:border-tag-dim hover:bg-tag-bg-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-tag-orange focus-visible:ring-offset-2 focus-visible:ring-offset-tag-bg data-[state=open]:border-tag-dim data-[state=open]:bg-tag-bg-deep'

const itemClass =
  'cursor-pointer rounded-sm px-3 py-2 font-mono text-[11px] uppercase tracking-[0.08em] text-tag-text focus:bg-tag-border/60 focus:text-tag-text'

interface LogoVariantProps {
  variant: 'white' | 'black'
}

const LogoVariant = ({ variant }: LogoVariantProps) => {
  const isWhite = variant === 'white'
  const bg = isWhite ? 'bg-tag-bg-deep' : 'bg-tag-text'
  const label = isWhite ? 'on dark' : 'on light'

  return (
    <div className="flex flex-col gap-4">
      <div
        className={`flex aspect-[4/3] items-center justify-center rounded-md border border-tag-border p-12 ${bg}`}
      >
        <Image
          src={`/brand/tag-logo-${variant}.svg`}
          alt={`TAG logo ${label}`}
          width={234}
          height={48}
          className="h-auto w-full max-w-[280px] object-contain"
          priority
          unoptimized
        />
      </div>

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger className={triggerClass}>
          <Download className="size-3.5" />
          Download
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-32 border-tag-border bg-tag-bg-deep p-1">
          <DropdownMenuItem asChild className={itemClass}>
            <a href={`/brand/tag-logo-${variant}.svg`} download={`tag-logo-${variant}.svg`}>
              SVG
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className={itemClass}>
            <a href={`/brand/tag-logo-${variant}.png`} download={`tag-logo-${variant}.png`}>
              PNG
            </a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export const LogoDownload = () => {
  return (
    <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
      <LogoVariant variant="white" />
      <LogoVariant variant="black" />
    </div>
  )
}
