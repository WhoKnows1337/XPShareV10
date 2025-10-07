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
    console.error('Global application error:', error)
  }, [error])

  return (
    <html>
      <body>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px',
          fontFamily: 'system-ui, sans-serif',
          background: 'linear-gradient(to bottom right, #f8fafc, #f3e8ff)',
        }}>
          <div style={{
            maxWidth: '500px',
            width: '100%',
            background: 'white',
            borderRadius: '12px',
            padding: '32px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#dc2626' }}>
              ⚠️ Critical Error
            </h2>
            <p style={{ marginBottom: '16px', color: '#64748b' }}>
              A critical error occurred. Please try refreshing the page.
            </p>
            {error.message && (
              <pre style={{
                fontSize: '12px',
                background: '#f1f5f9',
                padding: '12px',
                borderRadius: '6px',
                overflow: 'auto',
                maxHeight: '150px',
                marginBottom: '16px',
              }}>
                {error.message}
              </pre>
            )}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={reset}
                style={{
                  flex: 1,
                  padding: '10px 20px',
                  background: '#7c3aed',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500',
                }}
              >
                Try Again
              </button>
              <button
                onClick={() => (window.location.href = '/')}
                style={{
                  flex: 1,
                  padding: '10px 20px',
                  background: 'white',
                  color: '#7c3aed',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500',
                }}
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
