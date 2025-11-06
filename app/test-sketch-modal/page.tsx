'use client';

import { useState, useEffect } from 'react';
import { SketchModal } from '@/components/submit-observatory/screen4/SketchModal';
import { Button } from '@/components/ui/button';
import { Pencil, Check, X, Smartphone, Monitor, Tablet } from 'lucide-react';

export default function TestSketchModalPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [savedFile, setSavedFile] = useState<File | null>(null);
  const [scrollbarDetected, setScrollbarDetected] = useState<boolean | null>(null);
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    // Detect screen size
    const checkScreenSize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setScreenSize('mobile');
      } else if (width < 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    // Check for scrollbars when modal is open
    if (isOpen) {
      const checkScrollbars = () => {
        const excalidrawEl = document.querySelector('.excalidraw');
        if (excalidrawEl) {
          const hasVScroll = excalidrawEl.scrollHeight > excalidrawEl.clientHeight;
          const hasHScroll = excalidrawEl.scrollWidth > excalidrawEl.clientWidth;
          setScrollbarDetected(hasVScroll || hasHScroll);
        }
      };

      // Check after a delay to ensure Excalidraw is rendered
      const timer = setTimeout(checkScrollbars, 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSave = (file: File) => {
    console.log('Sketch saved as File:', file);
    setSavedFile(file);

    // Create object URL to display the saved sketch
    const url = URL.createObjectURL(file);
    console.log('Preview URL:', url);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Sketch Modal Test Page</h1>

        {/* Test Status Panel */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-4">Test Status</h2>

          {/* Screen Size Indicator */}
          <div className="flex items-center gap-3">
            <span className="font-medium">Screen Size:</span>
            <div className="flex items-center gap-2">
              {screenSize === 'mobile' && <Smartphone className="w-5 h-5" />}
              {screenSize === 'tablet' && <Tablet className="w-5 h-5" />}
              {screenSize === 'desktop' && <Monitor className="w-5 h-5" />}
              <span className="capitalize">{screenSize}</span>
              <span className="text-sm text-gray-500">({window.innerWidth}px)</span>
            </div>
          </div>

          {/* Scrollbar Detection */}
          <div className="flex items-center gap-3">
            <span className="font-medium">Scrollbars Detected:</span>
            {scrollbarDetected === null ? (
              <span className="text-gray-500">Not tested yet</span>
            ) : scrollbarDetected ? (
              <div className="flex items-center gap-1 text-red-600">
                <X className="w-5 h-5" />
                <span>Yes (ISSUE DETECTED!)</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-green-600">
                <Check className="w-5 h-5" />
                <span>No scrollbars ✅</span>
              </div>
            )}
          </div>

          {/* File Saved Status */}
          <div className="flex items-center gap-3">
            <span className="font-medium">File Saved:</span>
            {savedFile ? (
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                <span>{savedFile.name}</span>
                <span className="text-sm text-gray-500">({(savedFile.size / 1024).toFixed(2)} KB)</span>
              </div>
            ) : (
              <span className="text-gray-500">No file saved yet</span>
            )}
          </div>
        </div>

        {/* Mobile Warning */}
        {screenSize === 'mobile' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">
              <strong>Note:</strong> The sketch feature should be hidden on mobile devices (screens &lt; 768px).
              If you can see the sketch button below, there's an issue with the responsive implementation.
            </p>
          </div>
        )}

        {/* Open Sketch Button - Should be hidden on mobile */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Test Actions</h2>

          {/* Desktop/Tablet Button */}
          <button
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex w-full p-3 rounded-lg border-2 border-dashed border-blue-400
              hover:border-blue-600 hover:bg-blue-50 transition-all items-center justify-center gap-2"
          >
            <Pencil className="w-5 h-5 text-blue-600" />
            <span className="text-blue-600 font-medium">
              Open Sketch Modal (Desktop/Tablet Only)
            </span>
          </button>

          {/* Mobile Message */}
          <div className="sm:hidden p-3 rounded-lg bg-gray-100 text-center">
            <p className="text-gray-600">
              Sketch feature is not available on mobile devices
            </p>
          </div>
        </div>

        {/* Saved Image Preview */}
        {savedFile && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Saved Sketch Preview</h2>
            <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
              <img
                src={URL.createObjectURL(savedFile)}
                alt="Saved sketch"
                className="w-full h-auto"
              />
            </div>
          </div>
        )}

        {/* Technical Details */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Implementation Details</h2>
          <ul className="space-y-2 text-sm">
            <li>✅ React Portal renders outside DOM hierarchy</li>
            <li>✅ Fullscreen overlay with z-index: 99999</li>
            <li>✅ Hidden on mobile (&lt;768px) using Tailwind's sm: breakpoint</li>
            <li>✅ File object returned (not data URL)</li>
            <li>✅ ESC key handler for closing</li>
            <li>✅ Body scroll prevention when open</li>
          </ul>
        </div>
      </div>

      {/* Sketch Modal */}
      <SketchModal
        open={isOpen}
        onClose={() => {
          setIsOpen(false);
          setScrollbarDetected(null);
        }}
        onSave={handleSave}
      />
    </div>
  );
}