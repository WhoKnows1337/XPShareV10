'use client';

import { useState, useEffect } from 'react';
import { Excalidraw, exportToBlob } from '@excalidraw/excalidraw';
import '@excalidraw/excalidraw/index.css';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';

interface ExcalidrawAnnotationEditorProps {
  screenshot: string;
  onComplete: (annotatedImage: string) => void;
  onCancel: () => void;
}

export function ExcalidrawAnnotationEditor({
  screenshot,
  onComplete,
  onCancel,
}: ExcalidrawAnnotationEditorProps) {
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [initialData, setInitialData] = useState<any>(null);
  const [showHelp, setShowHelp] = useState(true);

  useEffect(() => {
    const loadScreenshot = async () => {
      try {
        // Load the screenshot as background image
        const img = new Image();
        img.src = screenshot;

        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });

        const width = img.width;
        const height = img.height;

        // Generate unique file ID
        const fileId = `file-${Date.now()}`;

        // Create image element for Excalidraw
        const imageElement: any = {
          type: 'image',
          id: `screenshot-${Date.now()}`,
          x: 0,
          y: 0,
          width: width,
          height: height,
          angle: 0,
          strokeColor: 'transparent',
          backgroundColor: 'transparent',
          fillStyle: 'solid',
          strokeWidth: 0,
          strokeStyle: 'solid',
          roughness: 0,
          opacity: 100,
          groupIds: [],
          frameId: null,
          roundness: null,
          seed: Math.floor(Math.random() * 100000),
          version: 1,
          versionNonce: Math.floor(Math.random() * 100000),
          isDeleted: false,
          boundElements: null,
          updated: Date.now(),
          link: null,
          locked: true, // Lock the background image
          fileId: fileId as any,
          status: 'saved',
          scale: [1, 1],
        };

        // Set initialData with both elements and files
        setInitialData({
          elements: [imageElement],
          files: {
            [fileId]: {
              mimeType: 'image/png',
              id: fileId,
              dataURL: screenshot,
              created: Date.now(),
            },
          },
          appState: {
            viewBackgroundColor: '#ffffff',
            selectedElementIds: {}, // Prevent background image from being selected
            currentItemStrokeColor: '#ef4444', // Default red color for annotations
            activeTool: { type: 'freedraw', locked: false }, // Default to pen tool
            currentItemStrokeWidth: 1, // Thin stroke
            currentItemFontFamily: 2, // Normal font (Helvetica)
          },
          scrollToContent: true,
        });
      } catch (error) {
        console.error('Error loading screenshot:', error);
      }
    };

    loadScreenshot();
  }, [screenshot]);

  const handleComplete = async () => {
    if (!excalidrawAPI) return;

    setIsExporting(true);
    try {
      const elements = excalidrawAPI.getSceneElements();
      const files = excalidrawAPI.getFiles();
      const appState = excalidrawAPI.getAppState();

      // Export to blob - let Excalidraw calculate dimensions automatically
      const blob = await exportToBlob({
        elements,
        files,
        appState: {
          ...appState,
          exportBackground: true,
          exportWithDarkMode: false,
        },
      });

      // Convert blob to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        onComplete(base64data);
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export annotated image');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative w-full h-screen bg-background">
      {/* Help Popover - Centered Top, Dismissible */}
      {showHelp && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[100] max-w-lg animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-card/95 backdrop-blur-sm border-2 border-border rounded-lg shadow-2xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-3xl flex-shrink-0">✏️</span>
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold text-base">Annotate Your Screenshot</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Draw, add arrows, or write notes to highlight issues or features. Your annotations help us understand exactly what you mean!
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 flex-shrink-0 -mt-1 -mr-1"
                onClick={() => setShowHelp(false)}
                title="Close help"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Hide Excalidraw UI elements */}
      <style>{`
        /* Hide library button - VERY AGGRESSIVE */
        .ToolIcon__library,
        button.ToolIcon__library,
        label.ToolIcon__library,
        [data-testid="library-icon"],
        [aria-label*="Library"],
        [title*="Library"] {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }

        /* Hide hamburger menu - all possible selectors */
        button[aria-label*="Menu"],
        button[title*="Menu"],
        .default-menu-trigger,
        .dropdown-menu-button,
        button.dropdown-menu-button,
        .App-menu__left button:first-child,
        .App-menu .Island:first-child button:first-child {
          display: none !important;
        }

        /* Hide help/question mark icon */
        button[aria-label*="Help"],
        button[title*="Help"],
        .HelpButton {
          display: none !important;
        }

        /* Hide image insert button */
        button[aria-label*="Image"],
        button[title*="Image"],
        .ToolIcon_type_button[aria-label*="Image"] {
          display: none !important;
        }

        /* Hide more tools button */
        button[aria-label*="More tools"],
        button[title*="More tools"],
        .ToolIcon__more {
          display: none !important;
        }

        /* Hide Opacity section in properties panel */
        .properties-content > label:has(.opacity-input),
        .properties-content > div:has(.opacity-input),
        .opacity-slider-container {
          display: none !important;
        }

        /* Hide Layers section in properties panel */
        .properties-content .buttonList.buttonList-stackHorizontal:has(button[aria-label*="Send to back"]),
        .properties-content .buttonList.buttonList-stackHorizontal:has(button[aria-label*="Send backward"]) {
          display: none !important;
        }

        /* Hide "Keep selected tool active" / Lock button */
        button[aria-label*="Lock tool"],
        button[title*="Lock tool"],
        button[aria-label*="Keep selected"],
        .ToolIcon__lock {
          display: none !important;
        }

        /* Hide Hand/Panning tool */
        button[aria-label*="Hand"],
        button[title*="Hand"],
        button[data-testid*="hand"],
        .ToolIcon_type_button[aria-label*="Hand"] {
          display: none !important;
        }

        /* Hide any remaining buttons that might be behind "Done" */
        .App-toolbar__extra-tools-trigger,
        button.App-toolbar__extra-tools-trigger {
          display: none !important;
        }
      `}</style>

      {/* Action Buttons - Fixed Top Right */}
      <div className="absolute top-4 right-4 z-[100] flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={isExporting}
        >
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={handleComplete}
          disabled={isExporting}
        >
          <Check className="mr-2 h-4 w-4" />
          {isExporting ? 'Exporting...' : 'Done'}
        </Button>
      </div>

      {/* Excalidraw Editor */}
      <div className="w-full h-full">
        {initialData && (
          <Excalidraw
            excalidrawAPI={(api) => setExcalidrawAPI(api)}
            initialData={initialData}
            viewModeEnabled={false}
            zenModeEnabled={false}
            gridModeEnabled={false}
            theme="light"
            UIOptions={{
              canvasActions: {
                loadScene: false,
                saveToActiveFile: false,
                export: false,
                saveAsImage: false,
              },
              welcomeScreen: false,
              tools: {
                image: false,
              },
            }}
          />
        )}
      </div>
    </div>
  );
}
