'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import '@excalidraw/excalidraw/index.css';

interface SketchModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (file: File) => void;
}

// Dynamic import for SSR compatibility
const Excalidraw = dynamic(
  () => import('@excalidraw/excalidraw').then((mod) => mod.Excalidraw),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 z-[9999] bg-white flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading drawing canvas...</div>
      </div>
    ),
  }
);

export function SketchModal({ open, onClose, onSave }: SketchModalProps) {
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // ESC key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const handleSave = async () => {
    if (!excalidrawAPI) return;

    try {
      setIsSaving(true);

      const elements = excalidrawAPI.getSceneElements();
      if (elements.length === 0) {
        alert('Please draw something first!');
        setIsSaving(false);
        return;
      }

      const appState = excalidrawAPI.getAppState();
      const files = excalidrawAPI.getFiles();

      const { exportToBlob } = await import('@excalidraw/excalidraw');
      const blob = await exportToBlob({
        elements,
        appState,
        files,
        mimeType: 'image/png',
      });

      const file = new File([blob], `sketch-${Date.now()}.png`, {
        type: 'image/png',
      });

      onSave(file);
      onClose();
    } catch (error) {
      console.error('Error saving sketch:', error);
      alert('Failed to save sketch');
    } finally {
      setIsSaving(false);
    }
  };

  if (!open || !mounted) return null;

  const modalContent = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-white"
      >
        {/* Container with explicit height as required by Excalidraw */}
        <div style={{ height: '100vh', width: '100vw' }}>
          <Excalidraw
            excalidrawAPI={(api) => setExcalidrawAPI(api)}
            initialData={{
              appState: {
                viewBackgroundColor: '#ffffff',
                currentItemStrokeColor: '#000000',
                currentItemFontFamily: 2, // Helvetica (normal)
                activeTool: { type: 'freedraw', locked: false },
                zenModeEnabled: true,
                gridSize: 0,
              },
            }}
            UIOptions={{
              canvasActions: {
                loadScene: false,
                export: false,
                saveAsImage: false,
                toggleTheme: false,
                changeViewBackgroundColor: false,
              },
              tools: {
                image: true,
              },
            }}
            renderTopRightUI={() => (
              <div className="flex items-center gap-2 mr-4">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="btn-observatory flex items-center gap-2 px-4 py-2 text-sm disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Sketch
                    </>
                  )}
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-black/5 rounded-lg transition-colors"
                  title="Close (ESC)"
                >
                  <X className="w-5 h-5 text-gray-700" />
                </button>
              </div>
            )}
          />
        </div>

        {/* Minimal CSS for UI hiding only */}
        <style jsx global>{`
          .excalidraw .default-sidebar-trigger,
          .excalidraw button[aria-label*='Menu'],
          .excalidraw .sidebar-trigger,
          .excalidraw .ToolIcon__lock,
          .excalidraw .dropdown-menu-button,
          .excalidraw button[aria-label*='More tools'],
          .excalidraw .excalidraw-sidebar,
          .excalidraw .layer-ui__library,
          .excalidraw .layer-ui__wrapper__footer-center,
          .excalidraw button[aria-label*='Layers'],
          .excalidraw .mobile-misc-tools-container {
            display: none !important;
          }
        `}</style>
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
