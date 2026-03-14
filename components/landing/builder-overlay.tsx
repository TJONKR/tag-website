'use client'

import { useEffect } from 'react'
import Image from 'next/image'

import type { Builder } from '@lib/builders/data'

interface BuilderOverlayProps {
  builder: Builder
  onClose: () => void
}

export const BuilderOverlay = ({ builder, onClose }: BuilderOverlayProps) => {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKey)
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" />

      {/* Scanline overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,95,31,0.4) 2px, rgba(255,95,31,0.4) 3px)',
        }}
      />

      {/* Content */}
      <div
        className="relative w-full max-w-4xl animate-in fade-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Corner accents */}
        <div className="absolute -left-px -top-px h-8 w-px bg-tag-orange shadow-[0_0_6px_rgba(255,95,31,0.5)]" />
        <div className="absolute -left-px -top-px h-px w-8 bg-tag-orange shadow-[0_0_6px_rgba(255,95,31,0.5)]" />
        <div className="absolute -right-px -top-px h-8 w-px bg-tag-orange shadow-[0_0_6px_rgba(255,95,31,0.5)]" />
        <div className="absolute -right-px -top-px h-px w-8 bg-tag-orange shadow-[0_0_6px_rgba(255,95,31,0.5)]" />
        <div className="absolute -bottom-px -left-px h-8 w-px bg-tag-orange shadow-[0_0_6px_rgba(255,95,31,0.5)]" />
        <div className="absolute -bottom-px -left-px h-px w-8 bg-tag-orange shadow-[0_0_6px_rgba(255,95,31,0.5)]" />
        <div className="absolute -bottom-px -right-px h-8 w-px bg-tag-orange shadow-[0_0_6px_rgba(255,95,31,0.5)]" />
        <div className="absolute -bottom-px -right-px h-px w-8 bg-tag-orange shadow-[0_0_6px_rgba(255,95,31,0.5)]" />

        <div className="border border-tag-border/50 bg-tag-bg/95 p-8 backdrop-blur-md max-md:p-6">
          {/* Header bar */}
          <div className="mb-6 flex items-center justify-between border-b border-tag-border/50 pb-4">
            <div className="flex items-center gap-3">
              <span className="inline-block size-2 rounded-full bg-tag-orange shadow-[0_0_8px_rgba(255,95,31,0.6)]" />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-tag-orange">
                Builder Profile
              </span>
            </div>
            <button
              onClick={onClose}
              className="font-mono text-[10px] uppercase tracking-[0.2em] text-tag-dim transition-colors hover:text-tag-orange"
            >
              [ESC] Close
            </button>
          </div>

          <div className="grid grid-cols-[240px_1fr] gap-8 max-md:grid-cols-1">
            {/* Image */}
            <div className="relative aspect-[3/4] overflow-hidden border border-tag-border/50">
              {builder.image ? (
                <Image
                  src={builder.image}
                  alt={builder.name}
                  fill
                  className="object-cover"
                  sizes="240px"
                />
              ) : (
                <>
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(135deg, ${builder.gradientFrom}, ${builder.gradientTo})`,
                    }}
                  />
                  <div className="absolute inset-0 bg-tag-orange/20 mix-blend-multiply" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-syne text-5xl font-bold text-tag-text/50">
                      {builder.initials}
                    </span>
                  </div>
                </>
              )}

              {/* Image scan line effect */}
              <div
                className="pointer-events-none absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(255,95,31,0.3) 4px, rgba(255,95,31,0.3) 5px)',
                }}
              />
            </div>

            {/* Info */}
            <div className="flex flex-col justify-center">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-tag-dim">
                Identity
              </div>
              <h2 className="mt-2 font-syne text-4xl font-bold text-tag-text max-md:text-3xl">
                {builder.name}
              </h2>

              <div className="mt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-tag-dim">
                Function
              </div>
              <p className="mt-2 font-grotesk text-lg text-tag-muted">{builder.role}</p>

              <div className="mt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-tag-dim">
                Status
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span
                  className={`inline-block size-2 rounded-full ${
                    builder.active
                      ? 'bg-tag-orange shadow-[0_0_8px_rgba(255,95,31,0.6)]'
                      : 'bg-tag-dim'
                  }`}
                />
                <span className="font-mono text-sm text-tag-muted">
                  {builder.active ? 'Active' : 'Alumni'}
                </span>
              </div>

              {/* Decorative data line */}
              <div className="mt-8 border-t border-tag-border/30 pt-4">
                <span className="font-mono text-[10px] text-tag-dim/50">
                  TAG://builders/{builder.slug}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
