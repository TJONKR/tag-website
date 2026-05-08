'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

import { toast } from '@components/toast'
import { cn } from '@lib/utils'

const QUOTE = "We don't wait for the future. We build it."
const CHAR_INTERVAL_MS = 40

interface ManifestoStepProps {
  name: string | null
  onComplete: () => Promise<void> | void
}

export const ManifestoStep = ({ name, onComplete }: ManifestoStepProps) => {
  const [typed, setTyped] = useState('')
  const [showWelcome, setShowWelcome] = useState(false)
  const [showCta, setShowCta] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let index = 0
    const interval = setInterval(() => {
      index += 1
      setTyped(QUOTE.slice(0, index))
      if (index >= QUOTE.length) {
        clearInterval(interval)
        const welcomeTimer = setTimeout(() => {
          setShowWelcome(true)
          const ctaTimer = setTimeout(() => setShowCta(true), 600)
          timers.push(ctaTimer)
        }, 300)
        timers.push(welcomeTimer)
      }
    }, CHAR_INTERVAL_MS)

    const timers: ReturnType<typeof setTimeout>[] = []
    return () => {
      clearInterval(interval)
      timers.forEach(clearTimeout)
    }
  }, [])

  const handleEnter = async () => {
    if (submitting) return
    setSubmitting(true)
    try {
      await onComplete()
    } catch (error) {
      toast({
        type: 'error',
        description: error instanceof Error ? error.message : 'Something went wrong.',
      })
      setSubmitting(false)
    }
  }

  const typingDone = typed.length >= QUOTE.length

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-6">
      <div className="w-full max-w-2xl text-center">
        <p className="font-syne text-3xl font-bold leading-tight text-tag-text sm:text-4xl">
          {typed}
          {!showWelcome && (
            <span className="ml-1 inline-block animate-pulse text-tag-orange">|</span>
          )}
        </p>

        <p
          className={cn(
            'mt-10 font-grotesk text-lg text-tag-muted transition-opacity duration-500 sm:text-xl',
            showWelcome ? 'opacity-100' : 'opacity-0'
          )}
        >
          Welcome to TAG{name ? `, ${name}` : ''}.
        </p>

        <div
          className={cn(
            'mt-10 transition-opacity duration-500',
            showCta ? 'opacity-100' : 'opacity-0'
          )}
        >
          <button
            type="button"
            onClick={handleEnter}
            disabled={!typingDone || submitting}
            className="inline-flex items-center gap-2 bg-tag-orange px-8 py-3 font-grotesk font-medium text-tag-bg-deep transition-colors hover:bg-[#e8551b] disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Entering...
              </>
            ) : (
              'Enter the portal →'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
