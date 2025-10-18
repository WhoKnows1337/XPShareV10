// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';
import { Button } from '@/components/ui/button';
import { X, Check } from 'lucide-react';

interface ExcalidrawAnnotationEditorProps {
  screenshot: string;
  onComplete: (annotatedDataUrl: string) => void;
  onCancel: () => void;
}

export function ExcalidrawAnnotationEditor({
  screenshot,
  onComplete,
  onCancel,
}: ExcalidrawAnnotationEditorProps) {
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
  const [initialData, setInitialData] = useState<any>(null);

  useEffect(() => {
    // Load screenshot as background image
    const loadScreenshot = async () => {
      try {
        const response = await fetch(screenshot);
        const blob = await response.blob();
        const file = new File([blob], 'screenshot.png', { type: 'image/png' });

        // Create initial data with screenshot as background
        const img = new Image();
        img.src = screenshot;

        img.onload = () => {
          setInitialData({
            elements: [],
            appState: {
              viewBackgroundColor: '#ffffff',
            },
            scrollToContent: true,
            files: {},
          });

          // Add image as element after Excalidraw loads
          setTimeout(() => {
            if (excalidrawAPI) {
              excalidrawAPI.addFiles([{
                id: 'screenshot-bg',
                dataURL: screenshot,
                mimeType: 'image/png',
                created: Date.now(),
              }]);

              const imageElement = {
                type: 'image',
                version: 1,
                versionNonce: Math.floor(Math.random() * 1000000),
                isDeleted: false,
                id: 'screenshot-image',
                fillStyle: 'solid',
                strokeWidth: 0,
                strokeStyle: 'solid',
                roughness: 0,
                opacity: 100,
                angle: 0,
                x: 0,
                y: 0,
                strokeColor: 'transparent',
                backgroundColor: 'transparent',
                width: img.width,
                height: img.height,
                seed: Math.floor(Math.random() * 1000000),
                groupIds: [],
                frameId: null,
                roundness: null,
                boundElements: [],
                updated: Date.now(),
                link: null,
                locked: true,
                fileId: 'screenshot-bg',
                scale: [1, 1],
                status: 'saved',
              };

              excalidrawAPI.updateScene({
                elements: [imageElement],
              });
            }
          }, 100);
        };
      } catch (error) {
        console.error('Failed to load screenshot:', error);
      }
    };

    if (screenshot && excalidrawAPI) {
      loadScreenshot();
    }
  }, [screenshot, excalidrawAPI]);

  const handleSave = async () => {
    if (!excalidrawAPI) return;

    try {
      // Export as PNG with all annotations
      const blob = await excalidrawAPI.exportToBlob({
        mimeType: 'image/png',
        quality: 0.95,
        exportPadding: 0,
      });

      // Convert blob to data URL
      const reader = new FileReader();
      reader.onloadend = () => {
        onComplete(reader.result as string);
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Failed to export annotation:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-muted/50">
        <div>
          <h2 className="text-lg font-semibold">Annotate Screenshot</h2>
          <p className="text-sm text-muted-foreground">
            Draw arrows, add text, or highlight areas
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Check className="h-4 w-4 mr-2" />
            Save Annotation
          </Button>
        </div>
      </div>

      {/* Excalidraw Canvas */}
      <div className="flex-1 relative">
        <Excalidraw
          excalidrawAPI={(api: any) => setExcalidrawAPI(api)}
          initialData={initialData}
          UIOptions={{
            canvasActions: {
              loadScene: false,
              export: false,
              saveToActiveFile: false,
            },
          }}
        />
      </div>
    </div>
  );
}
