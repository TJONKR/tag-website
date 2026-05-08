'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RotateCcw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full border border-tag-border bg-tag-card">
          <AlertTriangle className="size-6 text-tag-orange" />
        </div>
        <h1 className="mt-6 font-syne text-2xl font-bold text-tag-text">Something went wrong</h1>
        <p className="mt-3 text-sm leading-relaxed text-tag-muted">
          An unexpected error occurred. Try again, and if it keeps happening let a community
          manager know.
        </p>
        {error.digest && (
          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-tag-dim">
            ref: {error.digest}
          </p>
        )}
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-md border border-tag-orange/30 bg-tag-orange/10 px-4 py-2.5 font-mono text-xs uppercase tracking-[0.14em] text-tag-orange transition-colors hover:bg-tag-orange/20"
          >
            <RotateCcw className="size-3.5" />
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center rounded-md border border-tag-border px-4 py-2.5 font-mono text-xs uppercase tracking-[0.14em] text-tag-muted transition-colors hover:border-tag-orange/30 hover:text-tag-orange"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  )
}
