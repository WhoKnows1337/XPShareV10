'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Save, ArrowLeft } from 'lucide-react'
import { useSubmissionStore } from '@/lib/stores/submissionStore'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types/types'
import '@excalidraw/excalidraw/index.css'

// Dynamically import Excalidraw and exportToBlob
const Excalidraw = dynamic(
  async () => {
    const module = await import('@excalidraw/excalidraw')
    return module.Excalidraw
  },
  {
    ssr: false,
    loading: () => <Skeleton className="w-full h-[500px] rounded-lg" />,
  }
)

// Import exportToBlob separately
let exportToBlobFunction: any = null
if (typeof window !== 'undefined') {
  import('@excalidraw/excalidraw').then((module) => {
    exportToBlobFunction = module.exportToBlob
  })
}

export default function SketchPage() {
  const router = useRouter()
  const [description, setDescription] = useState('')
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null)

  const { setContent, setMediaFiles, mediaFiles } = useSubmissionStore()

  const handleSave = async () => {
    if (!excalidrawAPI || !exportToBlobFunction) {
      alert('Canvas wird geladen, bitte warte kurz...')
      return
    }

    try {
      // Export as PNG using the standalone exportToBlob function
      const elements = excalidrawAPI.getSceneElements()
      if (!elements || elements.length === 0) {
        alert('Bitte zeichne zuerst etwas!')
        return
      }

      const appState = excalidrawAPI.getAppState()
      const files = excalidrawAPI.getFiles()

      const blob = await exportToBlobFunction({
        elements,
        appState,
        files,
        mimeType: 'image/png',
        quality: 0.95,
        exportPadding: 20,
      })

      const file = new File([blob], `sketch-${Date.now()}.png`, { type: 'image/png' })
      const url = URL.createObjectURL(blob)

      // Add to media files
      setMediaFiles([
        ...mediaFiles,
        {
          type: 'image',
          file,
          url,
        },
      ])

      // Set description as content if provided
      if (description.trim()) {
        setContent(description)
      }

      // Navigate to compose
      router.push('/submit/compose')
    } catch (error) {
      console.error('Failed to export sketch:', error)
      alert('Fehler beim Exportieren der Skizze')
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push('/submit')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">✏️ Skizze zeichnen</h1>
          <p className="text-muted-foreground">Zeichne mit Hand-Drawn Style, was du gesehen hast</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Canvas Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-3"
        >
          <Card>
            <CardHeader>
              <CardTitle>Excalidraw Canvas</CardTitle>
              <CardDescription>
                Nutze die Hand-Drawn Tools um grob die Form zu skizzieren
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative w-full h-[500px] border-2 border-border rounded-lg overflow-hidden">
                {/* Hide Excalidraw hints with CSS */}
                <style jsx global>{`
                  /* Hide hint text */
                  .excalidraw-wrapper .excalidraw .panelColumn > div:first-child {
                    display: none !important;
                  }

                  /* Ensure canvas takes full space */
                  .excalidraw-wrapper {
                    width: 100%;
                    height: 100%;
                  }

                  .excalidraw-wrapper .excalidraw {
                    width: 100% !important;
                    height: 100% !important;
                  }
                `}</style>
                <div className="excalidraw-wrapper w-full h-full">
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
                        clearCanvas: true,
                        changeViewBackgroundColor: false,
                      },
                      tools: {
                        image: false,
                      },
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Description Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Beschreibung</CardTitle>
              <CardDescription>Beschreibe deine Skizze kurz</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Dreieckiges Objekt, bewegte sich schnell nach rechts..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[200px]"
              />

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">💡 Tipps:</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Zeichne grob die Form</li>
                  <li>• Nutze Pfeile für Bewegung</li>
                  <li>• Markiere besondere Lichter</li>
                  <li>• Hand-Drawn Style perfekt für UFOs!</li>
                </ul>
              </div>

              <Button
                onClick={handleSave}
                className="w-full"
                size="lg"
                disabled={!description.trim() || !excalidrawAPI}
              >
                <Save className="h-4 w-4 mr-2" />
                Fertig, weiter →
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
