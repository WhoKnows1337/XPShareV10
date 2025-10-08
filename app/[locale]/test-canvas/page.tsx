'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types/types'
import '@excalidraw/excalidraw/index.css'

// Dynamically import Excalidraw to avoid SSR issues
const Excalidraw = dynamic(
  async () => {
    const module = await import('@excalidraw/excalidraw')
    return module.Excalidraw
  },
  {
    ssr: false,
    loading: () => (
      <div className="w-screen h-screen flex items-center justify-center bg-white">
        Loading...
      </div>
    ),
  }
)

export default function TestCanvasPage() {
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null)

  // Clear Excalidraw localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Clear all Excalidraw-related localStorage
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('excalidraw')) {
          localStorage.removeItem(key)
        }
      })
    }
  }, [])

  return (
    <>
      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
          overflow: hidden;
        }

        /* Hide hint text */
        .excalidraw .panelColumn > div:first-child,
        [aria-label='Shapes'] > div:first-child,
        .excalidraw .Stack:first-child > div:first-child {
          display: none !important;
        }
      `}</style>

      <div style={{ width: '100vw', height: '100vh' }}>
        <Excalidraw
          excalidrawAPI={(api) => setExcalidrawAPI(api)}
          initialData={{
            elements: [],
            appState: {
              viewBackgroundColor: '#ffffff',
            },
            scrollToContent: false,
          }}
          UIOptions={{
            canvasActions: {
              loadScene: false,
              export: false,
              saveAsImage: false,
              clearCanvas: false,
              changeViewBackgroundColor: false,
            },
            tools: {
              image: false,
            },
          }}
        />
      </div>
    </>
  )
}
