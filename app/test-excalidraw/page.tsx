'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import '@excalidraw/excalidraw/index.css';

// Dynamic import for SSR compatibility
const Excalidraw = dynamic(
  () => import('@excalidraw/excalidraw').then((mod) => mod.Excalidraw),
  {
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-screen">Loading...</div>,
  }
);

export default function TestExcalidrawPage() {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <div className="flex items-center justify-center h-screen">
        <button
          onClick={() => setIsOpen(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Open Excalidraw Modal
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Fullscreen Modal */}
      <div
        className="fixed inset-0 z-[9999] bg-white"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        {/* Close button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 z-[10000] px-4 py-2 bg-red-500 text-white rounded"
        >
          Close (ESC)
        </button>

        {/* Excalidraw container */}
        <div
          style={{
            height: '100vh',
            width: '100vw',
            overflow: 'hidden',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          <Excalidraw
            initialData={{
              appState: {
                viewBackgroundColor: '#ffffff',
                zenModeEnabled: true,
                gridSize: 0,
                viewModeEnabled: false,
                scrollToContent: false,
              },
              scrollToContent: false,
            }}
            viewModeEnabled={false}
          />
        </div>

        {/* ULTRA AGGRESSIVE CSS */}
        <style jsx global>{`
          /* Kill ALL scrollbars */
          .excalidraw,
          .excalidraw *,
          .excalidraw .excalidraw-canvas-container,
          .excalidraw .excalidraw-canvas-container * {
            overflow: hidden !important;
            -ms-overflow-style: none !important;
            scrollbar-width: none !important;
          }

          .excalidraw::-webkit-scrollbar,
          .excalidraw *::-webkit-scrollbar {
            display: none !important;
            width: 0 !important;
            height: 0 !important;
          }

          .excalidraw {
            width: 100vw !important;
            height: 100vh !important;
            max-width: 100vw !important;
            max-height: 100vh !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
          }

          .excalidraw .excalidraw-canvas-container {
            width: 100% !important;
            height: 100% !important;
            max-width: 100vw !important;
            max-height: 100vh !important;
            position: relative !important;
          }
        `}</style>
      </div>
    </>
  );
}
