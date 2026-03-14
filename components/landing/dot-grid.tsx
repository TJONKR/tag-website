'use client'

import { useEffect, useRef } from 'react'

const SPACING = 30
const INFLUENCE = 150
const BASE_RADIUS = 1.5
const MAX_RADIUS = 4.5
const BASE_COLOR = { r: 42, g: 39, b: 36 }
const ACTIVE_COLOR = { r: 255, g: 95, b: 31 }

interface Dot {
  x: number
  y: number
  radius: number
  targetRadius: number
  r: number
  g: number
  b: number
  targetR: number
  targetG: number
  targetB: number
  rippleBoost: number
}

interface Ripple {
  x: number
  y: number
  radius: number
  maxRadius: number
  speed: number
  life: number
  ringWidth: number
}

function createDot(x: number, y: number): Dot {
  return {
    x,
    y,
    radius: BASE_RADIUS,
    targetRadius: BASE_RADIUS,
    r: BASE_COLOR.r,
    g: BASE_COLOR.g,
    b: BASE_COLOR.b,
    targetR: BASE_COLOR.r,
    targetG: BASE_COLOR.g,
    targetB: BASE_COLOR.b,
    rippleBoost: 0,
  }
}

function createRipple(x: number, y: number, maxDim: number): Ripple {
  return {
    x,
    y,
    radius: 0,
    maxRadius: maxDim * 0.6,
    speed: 5,
    life: 1,
    ringWidth: 40,
  }
}

export const DotGrid = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: -1000, y: -1000 })
  const dotsRef = useRef<Dot[]>([])
  const ripplesRef = useRef<Ripple[]>([])
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const parent = canvas.parentElement
    if (!parent) return

    let dpr = window.devicePixelRatio || 1

    const buildDots = () => {
      const cw = canvas.width / dpr
      const ch = canvas.height / dpr
      const cols = Math.ceil(cw / SPACING) + 1
      const rows = Math.ceil(ch / SPACING) + 1
      const offsetX = (cw - (cols - 1) * SPACING) / 2
      const offsetY = (ch - (rows - 1) * SPACING) / 2

      dotsRef.current = []
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          dotsRef.current.push(createDot(offsetX + col * SPACING, offsetY + row * SPACING))
        }
      }
    }

    const resize = () => {
      dpr = window.devicePixelRatio || 1
      const rect = parent.getBoundingClientRect()
      canvas.style.width = rect.width + 'px'
      canvas.style.height = rect.height + 'px'
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      buildDots()
    }

    resize()
    window.addEventListener('resize', resize)

    const onMouseMove = (e: MouseEvent) => {
      const rect = parent.getBoundingClientRect()
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }

    const onClick = (e: MouseEvent) => {
      const rect = parent.getBoundingClientRect()
      const maxDim = Math.max(rect.width, rect.height)
      ripplesRef.current.push(
        createRipple(e.clientX - rect.left, e.clientY - rect.top, maxDim)
      )
    }

    parent.addEventListener('mousemove', onMouseMove)
    parent.addEventListener('click', onClick)
    parent.addEventListener('mouseleave', () => {
      mouseRef.current = { x: -1000, y: -1000 }
    })

    const animate = () => {
      const cw = canvas.width / dpr
      const ch = canvas.height / dpr
      const { x: mx, y: my } = mouseRef.current

      ctx.clearRect(0, 0, cw, ch)

      // Update ripples
      ripplesRef.current = ripplesRef.current.filter((r) => {
        // Affect dots
        for (const dot of dotsRef.current) {
          const dx = dot.x - r.x
          const dy = dot.y - r.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          const ringDist = Math.abs(dist - r.radius)
          if (ringDist < r.ringWidth) {
            const t = 1 - ringDist / r.ringWidth
            dot.rippleBoost = Math.max(dot.rippleBoost, t * r.life)
          }
        }

        r.radius += r.speed
        r.life = 1 - r.radius / r.maxRadius
        if (r.life < 0) r.life = 0

        if (r.life > 0) {
          ctx.beginPath()
          ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(255,95,31,${r.life * 0.12})`
          ctx.lineWidth = 1.5
          ctx.stroke()
        }

        return r.life > 0
      })

      // Update and draw dots
      for (const dot of dotsRef.current) {
        const dx = dot.x - mx
        const dy = dot.y - my
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < INFLUENCE) {
          const t = 1 - dist / INFLUENCE
          const ease = t * t
          dot.targetRadius = BASE_RADIUS + (MAX_RADIUS - BASE_RADIUS) * ease
          dot.targetR = BASE_COLOR.r + (ACTIVE_COLOR.r - BASE_COLOR.r) * ease
          dot.targetG = BASE_COLOR.g + (ACTIVE_COLOR.g - BASE_COLOR.g) * ease
          dot.targetB = BASE_COLOR.b + (ACTIVE_COLOR.b - BASE_COLOR.b) * ease
        } else {
          dot.targetRadius = BASE_RADIUS
          dot.targetR = BASE_COLOR.r
          dot.targetG = BASE_COLOR.g
          dot.targetB = BASE_COLOR.b
        }

        if (dot.rippleBoost > 0) {
          dot.targetRadius = Math.max(
            dot.targetRadius,
            BASE_RADIUS + (MAX_RADIUS - BASE_RADIUS) * dot.rippleBoost
          )
          dot.targetR = Math.max(
            dot.targetR,
            BASE_COLOR.r + (ACTIVE_COLOR.r - BASE_COLOR.r) * dot.rippleBoost
          )
          dot.targetG = Math.max(
            dot.targetG,
            BASE_COLOR.g + (ACTIVE_COLOR.g - BASE_COLOR.g) * dot.rippleBoost
          )
          dot.targetB = Math.max(
            dot.targetB,
            BASE_COLOR.b + (ACTIVE_COLOR.b - BASE_COLOR.b) * dot.rippleBoost
          )
          dot.rippleBoost *= 0.94
          if (dot.rippleBoost < 0.01) dot.rippleBoost = 0
        }

        const lerpSpeed = 0.12
        dot.radius += (dot.targetRadius - dot.radius) * lerpSpeed
        dot.r += (dot.targetR - dot.r) * lerpSpeed
        dot.g += (dot.targetG - dot.g) * lerpSpeed
        dot.b += (dot.targetB - dot.b) * lerpSpeed

        ctx.beginPath()
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgb(${Math.round(dot.r)},${Math.round(dot.g)},${Math.round(dot.b)})`
        ctx.fill()

        if (dot.radius > BASE_RADIUS + 0.8) {
          const glowStrength = (dot.radius - BASE_RADIUS) / (MAX_RADIUS - BASE_RADIUS)
          ctx.beginPath()
          ctx.arc(dot.x, dot.y, dot.radius * 2.5, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255,95,31,${glowStrength * 0.08})`
          ctx.fill()
        }
      }

      // Connection lines
      const activeDots = dotsRef.current.filter((d) => d.radius > BASE_RADIUS + 0.5)
      for (let i = 0; i < activeDots.length; i++) {
        for (let j = i + 1; j < activeDots.length; j++) {
          const a = activeDots[i]
          const b = activeDots[j]
          const ddx = a.x - b.x
          const ddy = a.y - b.y
          const ddist = Math.sqrt(ddx * ddx + ddy * ddy)
          if (ddist < 60) {
            const strength = (1 - ddist / 60) * 0.15
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = `rgba(${Math.round((a.r + b.r) / 2)},${Math.round((a.g + b.g) / 2)},${Math.round((a.b + b.b) / 2)},${strength})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
      parent.removeEventListener('mousemove', onMouseMove)
      parent.removeEventListener('click', onClick)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0"
      style={{ pointerEvents: 'none' }}
    />
  )
}
