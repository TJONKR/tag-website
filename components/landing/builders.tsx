'use client'

import { useEffect, useRef, useCallback } from 'react'

import { useScrollReveal } from '@hooks/use-scroll-reveal'
import { gridBuilders } from '@lib/builders/data'

import { BuilderCard } from './builder-card'

const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t))

interface BuildersProps {
  memberCount?: number
}

export const Builders = ({ memberCount = 0 }: BuildersProps) => {
  const counterTarget = memberCount > 0 ? memberCount : gridBuilders.length
  const sectionRef = useScrollReveal()
  const counterRef = useRef<HTMLDivElement>(null)
  const hasAnimated = useRef(false)

  const animateCounter = useCallback(() => {
    if (hasAnimated.current) return
    hasAnimated.current = true

    const el = counterRef.current
    if (!el) return

    const duration = 2000
    const startTime = performance.now()

    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const current = Math.floor(easeOutExpo(progress) * counterTarget)
      el.textContent = current + '+'
      if (progress < 1) {
        requestAnimationFrame(tick)
      } else {
        el.textContent = counterTarget + '+'
      }
    }
    requestAnimationFrame(tick)
  }, [counterTarget])

  useEffect(() => {
    const el = counterRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter()
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.3 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [animateCounter])

  return (
    <section id="builders" ref={sectionRef} className="scanlines relative overflow-hidden">
      {/* Full card grid as background — 6 cols × 3 rows on desktop */}
      <div className="grid grid-cols-6 max-lg:grid-cols-4 max-md:grid-cols-3 max-sm:grid-cols-2">
        {gridBuilders.map((builder, i) => (
          <BuilderCard key={builder.slug} builder={builder} index={i} />
        ))}
      </div>

      {/* Content overlay */}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-[60px] max-md:p-8">
        {/* Heading */}
        <h2 className="reveal font-syne text-[clamp(48px,8vw,72px)] text-tag-text drop-shadow-[0_2px_30px_rgba(0,0,0,0.9)]">
          THE BUILDERS
        </h2>

        {/* Bottom: counter */}
        <div>
          <div className="reveal">
            <div
              ref={counterRef}
              className="font-mono text-[clamp(64px,12vw,96px)] font-bold leading-none text-tag-text drop-shadow-[0_2px_30px_rgba(0,0,0,0.9)]"
            >
              0+
            </div>
            <div className="mt-2 font-grotesk text-base font-medium text-tag-muted drop-shadow-[0_1px_12px_rgba(0,0,0,0.9)]">
              builders and counting
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
