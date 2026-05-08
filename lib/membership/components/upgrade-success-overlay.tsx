'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { cn } from '@lib/utils'

const QUOTE = "TAG is built by the ones who show up."
const CHAR_INTERVAL_MS = 40

interface UpgradeSuccessOverlayProps {
  name: string | null
}

export const UpgradeSuccessOverlay = ({ name }: UpgradeSuccessOverlayProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isOpen = searchParams.get('upgrade') === 'success'

  const [typed, setTyped] = useState('')
  const [showThanks, setShowThanks] = useState(false)
  const [showBody, setShowBody] = useState(false)
  const [showCta, setShowCta] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setTyped('')
      setShowThanks(false)
      setShowBody(false)
      setShowCta(false)
      return
    }

    const timers: ReturnType<typeof setTimeout>[] = []
    let index = 0
    const interval = setInterval(() => {
      index += 1
      setTyped(QUOTE.slice(0, index))
      if (index >= QUOTE.length) {
        clearInterval(interval)
        timers.push(setTimeout(() => setShowThanks(true), 300))
        timers.push(setTimeout(() => setShowBody(true), 1000))
        timers.push(setTimeout(() => setShowCta(true), 1700))
      }
    }, CHAR_INTERVAL_MS)

    return () => {
      clearInterval(interval)
      timers.forEach(clearTimeout)
    }
  }, [isOpen])

  if (!isOpen) return null

  const dismiss = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('upgrade')
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  const typingDone = typed.length >= QUOTE.length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-tag-bg/95 px-6 backdrop-blur-sm">
      <div className="w-full max-w-2xl text-center">
        <p className="font-syne text-3xl font-bold leading-tight text-tag-text sm:text-4xl">
          {typed}
          {!typingDone && (
            <span className="ml-1 inline-block animate-pulse text-tag-orange">|</span>
          )}
        </p>

        <p
          className={cn(
            'mt-10 font-grotesk text-lg text-tag-muted transition-opacity duration-500 sm:text-xl',
            showThanks ? 'opacity-100' : 'opacity-0'
          )}
        >
          Thank you{name ? `, ${name}` : ''}.
        </p>

        <p
          className={cn(
            'mx-auto mt-6 max-w-xl font-grotesk text-base leading-relaxed text-tag-muted transition-opacity duration-500',
            showBody ? 'opacity-100' : 'opacity-0'
          )}
        >
          Your contribution is what keeps TAG real — the space, the events,
          the people, what we build next. We&apos;re glad you&apos;re in.
        </p>

        <div
          className={cn(
            'mt-10 transition-opacity duration-500',
            showCta ? 'opacity-100' : 'opacity-0'
          )}
        >
          <button
            type="button"
            onClick={dismiss}
            disabled={!showCta}
            className="inline-flex items-center gap-2 bg-tag-orange px-8 py-3 font-grotesk font-medium text-tag-bg-deep transition-colors hover:bg-[#e8551b] disabled:opacity-50"
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  )
}
