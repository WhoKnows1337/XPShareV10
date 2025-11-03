'use client';

import { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MediaPreviewModalProps {
  files: Array<{ id: string; name: string; type: string; preview?: string }>;
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

/**
 * Lightbox modal for previewing images and videos
 * Supports keyboard navigation (ESC, Arrow keys)
 */
export function MediaPreviewModal({
  files,
  currentIndex,
  onClose,
  onNext,
  onPrevious,
}: MediaPreviewModalProps) {
  const currentFile = files[currentIndex];
  const hasMultiple = files.length > 1;
  const isImage = currentFile?.type.startsWith('image/');
  const isVideo = currentFile?.type.startsWith('video/');

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' && hasMultiple) {
        onNext();
      } else if (e.key === 'ArrowLeft' && hasMultiple) {
        onPrevious();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNext, onPrevious, hasMultiple]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (!currentFile) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Media preview"
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all z-10"
        aria-label="Close preview"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Previous button */}
      {hasMultiple && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrevious();
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all z-10"
          aria-label="Previous file"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Next button */}
      {hasMultiple && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all z-10"
          aria-label="Next file"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Content */}
      <div
        className="relative max-w-7xl max-h-[90vh] w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* File info */}
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent text-white z-10">
          <p className="text-lg font-medium truncate">{currentFile.name}</p>
          {hasMultiple && (
            <p className="text-sm text-white/70">
              {currentIndex + 1} of {files.length}
            </p>
          )}
        </div>

        {/* Media display */}
        <div className="flex items-center justify-center h-full">
          {isImage && currentFile.preview ? (
            <img
              src={currentFile.preview}
              alt={currentFile.name}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
          ) : isVideo && currentFile.preview ? (
            <video
              src={currentFile.preview}
              controls
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              autoPlay
            >
              <track kind="captions" />
            </video>
          ) : (
            <div className="text-white text-center">
              <p className="text-lg">Preview not available</p>
              <p className="text-sm text-white/70 mt-2">{currentFile.name}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
