'use client'

import { useEffect } from 'react'

export default function GlobalError({
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
    <html>
      <body
        style={{
          margin: 0,
          fontFamily: 'system-ui, sans-serif',
          backgroundColor: '#0a0a0a',
          color: '#f5f5f5',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}
      >
        <div style={{ maxWidth: '420px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>
            Something went wrong
          </h1>
          <p style={{ color: '#a3a3a3', lineHeight: 1.6, marginBottom: '24px' }}>
            An unexpected error occurred. Try again, and if it keeps happening let a community
            manager know.
          </p>
          {error.digest && (
            <p style={{ color: '#737373', fontSize: '12px', marginBottom: '24px' }}>
              ref: {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            style={{
              background: 'rgba(255, 95, 31, 0.1)',
              color: '#ff5f1f',
              border: '1px solid rgba(255, 95, 31, 0.3)',
              padding: '10px 20px',
              borderRadius: '6px',
              fontSize: '12px',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
