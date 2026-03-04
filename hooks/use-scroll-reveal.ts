'use client'

import { useEffect, useRef } from 'react'

interface UseScrollRevealOptions {
  threshold?: number
  rootMargin?: string
}

export const useScrollReveal = ({
  threshold = 0.15,
  rootMargin = '0px 0px -50px 0px',
}: UseScrollRevealOptions = {}) => {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold, rootMargin }
    )

    // Observe the element itself and any reveal children
    const revealSelectors = ['.reveal', '.reveal-scale', '.reveal-up']
    const elements = el.querySelectorAll(revealSelectors.join(','))

    elements.forEach((child) => observer.observe(child))

    // Also observe the element itself if it has a reveal class
    if (
      el.classList.contains('reveal') ||
      el.classList.contains('reveal-scale') ||
      el.classList.contains('reveal-up')
    ) {
      observer.observe(el)
    }

    return () => observer.disconnect()
  }, [threshold, rootMargin])

  return ref
}
