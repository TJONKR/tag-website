'use client'

import { useEffect, useRef, useState } from 'react'

import { cn } from '@lib/utils'

interface FadeInProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export const FadeIn = ({ children, className, delay = 0 }: FadeInProps) => {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(timeout)
  }, [delay])

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all duration-500 ease-out',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
        className
      )}
    >
      {children}
    </div>
  )
}

interface StaggerProps {
  children: React.ReactNode
  className?: string
  staggerMs?: number
  baseDelay?: number
}

export const Stagger = ({ children, className, staggerMs = 75, baseDelay = 0 }: StaggerProps) => {
  const items = Array.isArray(children) ? children : [children]

  return (
    <div className={className}>
      {items.map((child, i) => (
        <FadeIn key={i} delay={baseDelay + i * staggerMs}>
          {child}
        </FadeIn>
      ))}
    </div>
  )
}
