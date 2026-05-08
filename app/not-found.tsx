'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Eraser, SprayCan } from 'lucide-react'

import { cn } from '@lib/utils'

const PALETTE = [
  { name: 'orange', value: '#ff5f1f' },
  { name: 'white', value: '#f5f5f0' },
  { name: 'magenta', value: '#ff2bd6' },
  { name: 'cyan', value: '#00e5ff' },
  { name: 'lime', value: '#b6ff3c' },
  { name: 'violet', value: '#9d5cff' },
] as const

const SPRAY_RADIUS = 34
const DOTS_PER_TICK = 110

export default function NotFound() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const isSprayingRef = useRef(false)
  const [color, setColor] = useState<string>(PALETTE[0].value)
  const colorRef = useRef(color)

  useEffect(() => {
    colorRef.current = color
  }, [color])

  const resize = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const w = window.innerWidth
    const h = window.innerHeight
    // Preserve any existing painting across resizes
    const prev = canvas.toDataURL()
    canvas.width = Math.floor(w * dpr)
    canvas.height = Math.floor(h * dpr)
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    if (prev && prev !== 'data:,') {
      const img = new Image()
      img.onload = () => ctx.drawImage(img, 0, 0, w, h)
      img.src = prev
    }
  }, [])

  useEffect(() => {
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [resize])

  const spray = useCallback((x: number, y: number) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    ctx.fillStyle = colorRef.current
    for (let i = 0; i < DOTS_PER_TICK; i += 1) {
      const angle = Math.random() * Math.PI * 2
      // Bias toward the center for a denser core, sparser edge fade
      const radius = Math.pow(Math.random(), 1.6) * SPRAY_RADIUS
      const dx = Math.cos(angle) * radius
      const dy = Math.sin(angle) * radius
      // Most dots are 1px; a few are 2px splatters near the center for body
      const size = radius < SPRAY_RADIUS * 0.35 && Math.random() < 0.25 ? 2 : 1
      ctx.globalAlpha = 0.32 + Math.random() * 0.35
      ctx.fillRect(x + dx, y + dy, size, size)
    }
    // Occasional drip / heavier splat near cursor — gives that wet-paint feel
    if (Math.random() < 0.12) {
      ctx.globalAlpha = 0.5 + Math.random() * 0.3
      ctx.fillRect(
        x + (Math.random() - 0.5) * 6,
        y + (Math.random() - 0.5) * 6,
        2 + Math.floor(Math.random() * 2),
        2 + Math.floor(Math.random() * 2)
      )
    }
    ctx.globalAlpha = 1
  }, [])

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isSprayingRef.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    spray(e.clientX, e.clientY)
  }

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isSprayingRef.current) return
    spray(e.clientX, e.clientY)
  }

  const stop = (e?: React.PointerEvent<HTMLCanvasElement>) => {
    isSprayingRef.current = false
    if (e) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId)
      } catch {
        /* ignore */
      }
    }
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-tag-bg text-tag-text">
      {/* Spray canvas — full viewport, captures all pointer events */}
      <canvas
        ref={canvasRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={stop}
        onPointerCancel={stop}
        onPointerLeave={stop}
        className="fixed inset-0 z-10 cursor-crosshair touch-none"
        aria-label="Graffiti canvas. Drag to spray."
      />

      {/* Static centerpiece — pointer-events disabled so spray works through it */}
      <div className="pointer-events-none relative z-20 flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-tag-dim">
          404 — page not found
        </p>
        <h1 className="mt-6 font-syne text-[18vw] font-bold leading-none text-tag-text/15 sm:text-[160px]">
          404
        </h1>
        <p className="mt-6 max-w-md font-grotesk text-base leading-relaxed text-tag-muted">
          This page doesn&apos;t exist yet. But the wall&apos;s yours — leave your mark.
        </p>
      </div>

      {/* Sticky controls — fixed to bottom of viewport */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex flex-col items-center gap-3 px-6 pb-6 pt-10">
        <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-tag-border bg-tag-card/85 p-2 shadow-[0_8px_24px_rgba(0,0,0,0.35)] backdrop-blur-md">
          <SprayCan className="ml-2 size-4 shrink-0 text-tag-dim" />
          {PALETTE.map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => setColor(c.value)}
              aria-label={`Use ${c.name}`}
              className={cn(
                'size-7 rounded-full border-2 transition-transform',
                color === c.value
                  ? 'scale-110 border-tag-text'
                  : 'border-transparent hover:scale-105'
              )}
              style={{ backgroundColor: c.value }}
            />
          ))}
          <span className="mx-1 h-6 w-px bg-tag-border" aria-hidden />
          <button
            type="button"
            onClick={clearCanvas}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-tag-muted transition-colors hover:text-tag-orange"
          >
            <Eraser className="size-3.5" />
            Clear
          </button>
          <span className="mx-1 h-6 w-px bg-tag-border" aria-hidden />
          <Link
            href="/"
            className="rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-tag-muted transition-colors hover:text-tag-orange"
          >
            Back to TAG →
          </Link>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-tag-dim">
          drag to spray
        </p>
      </div>
    </div>
  )
}
