'use client';

import { useState } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';

// Dynamic import of tldraw to avoid SSR issues
const Tldraw = dynamic(
  async () => {
    const { Tldraw } = await import('tldraw');
    return Tldraw;
  },
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[500px] bg-space-deep/60">
        <Loader2 className="w-8 h-8 text-observatory-gold animate-spin" />
      </div>
    ),
  }
);

interface SketchModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (file: File) => void;
}

export function SketchModal({ open, onClose, onSave }: SketchModalProps) {
  const [editor, setEditor] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!editor) return;

    try {
      setIsSaving(true);

      // Get all shapes on canvas
      const shapes = editor.getCurrentPageShapes();
      if (shapes.length === 0) {
        alert('Please draw something first!');
        setIsSaving(false);
        return;
      }

      // Export to SVG first
      const svg = await editor.getSvg(shapes);
      if (!svg) {
        throw new Error('Failed to generate SVG');
      }

      // Convert SVG to PNG blob
      const svgString = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width || 800;
        canvas.height = img.height || 600;
        ctx?.drawImage(img, 0, 0);

        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `sketch-${Date.now()}.png`, {
              type: 'image/png',
            });
            onSave(file);
            onClose();
          }
          setIsSaving(false);
        }, 'image/png');
      };

      img.onerror = () => {
        alert('Failed to convert sketch to image');
        setIsSaving(false);
      };

      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
    } catch (error) {
      console.error('Error saving sketch:', error);
      alert('Failed to save sketch');
      setIsSaving(false);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-4xl glass-card overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-glass-border">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Draw a Sketch</h2>
              <p className="text-xs text-text-tertiary mt-0.5">
                Use the tools below to draw, then save your sketch
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-space-deep/40 rounded-lg transition-all"
            >
              <X className="w-5 h-5 text-text-secondary" />
            </button>
          </div>

          {/* tldraw Canvas */}
          <div className="h-[500px] bg-white">
            <Tldraw
              onMount={(editor) => setEditor(editor)}
              persistenceKey="xpshare-sketch"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t border-glass-border">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn-observatory flex items-center gap-2 px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
