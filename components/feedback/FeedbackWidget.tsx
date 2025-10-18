'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Bug, X, GripVertical, Minimize2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FeedbackForm } from './FeedbackForm';

// Dynamic import to avoid SSR issues with Excalidraw (uses navigator)
const ExcalidrawAnnotationEditor = dynamic(
  () => import('./ExcalidrawAnnotationEditor').then((mod) => mod.ExcalidrawAnnotationEditor),
  { ssr: false }
);

export function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [capturedScreenshot, setCapturedScreenshot] = useState<string | null>(null);
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Check if first time seeing feedback widget
  useEffect(() => {
    const hasSeenTooltip = localStorage.getItem('xpshare-feedback-widget-seen');
    if (!hasSeenTooltip) {
      // Show tooltip after 1 second
      const timer = setTimeout(() => {
        setShowTooltip(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleOpenFeedback = () => {
    setIsOpen(true);
    if (showTooltip) {
      setShowTooltip(false);
      localStorage.setItem('xpshare-feedback-widget-seen', 'true');
    }
  };

  const handleStartScreenshot = async () => {
    try {
      // Minimize panel temporarily
      setIsOpen(false);

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 100));

      // Import screenshot utility dynamically to avoid SSR issues
      const { captureScreenshot } = await import('./screenshot-utils');

      // Capture the screenshot
      const dataUrl = await captureScreenshot();
      setCapturedScreenshot(dataUrl);
      setIsAnnotating(true);
    } catch (error) {
      console.error('Screenshot capture failed:', error);
      // Reopen panel on error
      setIsOpen(true);
    }
  };

  const handleStartAreaScreenshot = async () => {
    try {
      // Minimize panel temporarily
      setIsOpen(false);

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 100));

      // Import screenshot utility dynamically to avoid SSR issues
      const { captureAreaScreenshot } = await import('./screenshot-utils');

      // Capture the selected area
      const dataUrl = await captureAreaScreenshot();
      setCapturedScreenshot(dataUrl);
      setIsAnnotating(true);
    } catch (error) {
      console.error('Area screenshot capture failed:', error);
      // Reopen panel on error (unless user cancelled)
      if (error instanceof Error && error.message !== 'Screenshot cancelled') {
        setIsOpen(true);
      } else {
        // User cancelled, just reopen
        setIsOpen(true);
      }
    }
  };

  const handleAnnotationComplete = (annotatedDataUrl: string) => {
    setScreenshots((prev) => [...prev, annotatedDataUrl]);
    setCapturedScreenshot(null);
    setIsAnnotating(false);
    setIsOpen(true);
  };

  const handleAnnotationCancel = () => {
    setCapturedScreenshot(null);
    setIsAnnotating(false);
    setIsOpen(true);
  };

  const handleRemoveScreenshot = (index: number) => {
    setScreenshots((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && !isAnnotating && (
        <div className="fixed bottom-6 right-6 z-50">
          {/* First-time Tooltip */}
          {showTooltip && (
            <div className="absolute bottom-full right-0 mb-4 w-64 p-3 bg-red-500/95 backdrop-blur-sm border border-red-600 rounded-lg shadow-xl animate-tooltip-bounce">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-white mb-1">
                    Found a bug?
                  </div>
                  <div className="text-xs text-white/90">
                    Report bugs, request features, or send general feedback. Screenshots can be annotated!
                  </div>
                </div>
              </div>
              {/* Tooltip Arrow */}
              <div className="absolute -bottom-2 right-6 w-4 h-4 bg-red-500/95 border-r border-b border-red-600 rotate-45" />
            </div>
          )}

          <Button
            onClick={handleOpenFeedback}
            className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all bg-red-500 hover:bg-red-600 text-white"
            size="icon"
            aria-label="Report bug or send feedback"
            title="Report bug or send feedback"
          >
            <Bug className="h-6 w-6" />
          </Button>
        </div>
      )}

      {/* Floating Feedback Panel (NO overlay, draggable) */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[480px] max-h-[85vh] bg-card border-2 border-border rounded-lg shadow-2xl z-50 flex flex-col overflow-hidden">
          {/* Header with drag handle */}
          <div className="flex items-center justify-between p-4 border-b bg-muted/50 cursor-move">
            <div className="flex items-center gap-2">
              <GripVertical className="h-5 w-5 text-muted-foreground" />
              <div>
                <h2 className="text-lg font-semibold">Send Feedback</h2>
                <p className="text-sm text-muted-foreground">Help us improve XPShare</p>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8"
                title="Minimize"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsOpen(false);
                  setScreenshots([]);
                }}
                className="h-8 w-8"
                title="Close and discard"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content with scroll */}
          <div className="flex-1 overflow-y-auto p-4">
            <FeedbackForm
              onSuccess={() => {
                setIsOpen(false);
                setScreenshots([]);
              }}
              onStartScreenshot={handleStartScreenshot}
              onStartAreaScreenshot={handleStartAreaScreenshot}
              screenshots={screenshots}
              onRemoveScreenshot={handleRemoveScreenshot}
            />
          </div>
        </div>
      )}

      {/* Full-screen Annotation Editor */}
      {isAnnotating && capturedScreenshot && (
        <div className="fixed inset-0 z-[100] bg-background">
          <ExcalidrawAnnotationEditor
            screenshot={capturedScreenshot}
            onComplete={handleAnnotationComplete}
            onCancel={handleAnnotationCancel}
          />
        </div>
      )}
    </>
  );
}
