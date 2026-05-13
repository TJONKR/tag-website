'use client'

import { toast } from '@components/toast'

interface ColorSwatchProps {
  name: string
  token: string
  hex: string
  className: string
  textClass?: string
}

export const ColorSwatch = ({ name, token, hex, className, textClass }: ColorSwatchProps) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(hex)
      toast({ type: 'success', description: `${hex} copied` })
    } catch {
      toast({ type: 'error', description: 'Copy failed' })
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={`Copy ${hex}`}
      className="group flex flex-col overflow-hidden rounded-md border border-tag-border text-left transition-colors hover:border-tag-orange focus:outline-none focus-visible:border-tag-orange"
    >
      <div className={`flex h-32 items-end p-3 ${className}`}>
        <span
          className={`font-mono text-[11px] uppercase tracking-[0.08em] ${textClass ?? 'text-tag-text'}`}
        >
          {hex}
        </span>
      </div>
      <div className="flex flex-col gap-1 bg-tag-bg-deep p-3">
        <span className="font-syne text-sm text-tag-text">{name}</span>
        <span className="font-mono text-[11px] text-tag-dim">{token}</span>
      </div>
    </button>
  )
}
