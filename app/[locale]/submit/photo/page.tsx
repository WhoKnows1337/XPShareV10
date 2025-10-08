'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Camera,
  Upload,
  X,
  ArrowLeft,
  Sparkles,
  Image as ImageIcon,
  Info,
} from 'lucide-react'
import { useSubmissionStore } from '@/lib/stores/submissionStore'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

export default function PhotoPage() {
  const router = useRouter()
  const [images, setImages] = useState<Array<{ file: File; preview: string }>>([])
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { setContent, setMediaFiles, setStep, reset } = useSubmissionStore()

  const MAX_FILES = 5
  const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setError(null)

    if (images.length + files.length > MAX_FILES) {
      setError(`Maximal ${MAX_FILES} Fotos erlaubt`)
      return
    }

    const validFiles: Array<{ file: File; preview: string }> = []

    files.forEach((file) => {
      // Check file type
      if (!file.type.startsWith('image/')) {
        setError('Nur Bilddateien erlaubt')
        return
      }

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        setError('Datei zu groß. Maximal 10MB pro Foto.')
        return
      }

      // Create preview
      const preview = URL.createObjectURL(file)
      validFiles.push({ file, preview })
    })

    setImages((prev) => [...prev, ...validFiles])
  }

  const removeImage = (index: number) => {
    setImages((prev) => {
      const newImages = [...prev]
      URL.revokeObjectURL(newImages[index].preview) // Clean up
      newImages.splice(index, 1)
      return newImages
    })
  }

  const handleContinue = () => {
    if (images.length === 0) {
      setError('Bitte lade mindestens ein Foto hoch')
      return
    }

    if (description.trim().length < 20) {
      setError('Bitte beschreibe das Foto mit mindestens 20 Zeichen')
      return
    }

    // Store in submission store
    reset()
    setContent(description)
    setMediaFiles(
      images.map((img) => ({
        type: 'image' as const,
        file: img.file,
        url: img.preview,
      }))
    )
    setStep(2)

    // Navigate to compose page
    router.push('/submit/compose')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück
        </Button>
        <div className="flex-1">
          <h1 className="text-4xl font-bold">📷 Foto hochladen</h1>
          <p className="text-muted-foreground">
            Zeig uns, was du gesehen hast
          </p>
        </div>
      </div>

      {/* Info Alert */}
      {images.length === 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            💡 Tipp: Du kannst bis zu {MAX_FILES} Fotos hochladen. Beschreibe dann, was auf den Bildern zu sehen ist.
          </AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Upload Area */}
      <Card className="border-2 border-primary/20">
        <CardContent className="pt-6">
          <div
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="flex flex-col items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                <Upload className="h-8 w-8 text-blue-500" />
              </div>

              <div>
                <p className="text-lg font-semibold mb-1">
                  Fotos hochladen
                </p>
                <p className="text-sm text-muted-foreground">
                  Klicke oder ziehe Dateien hierher
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  PNG, JPG, WEBP bis zu 10MB • Max {MAX_FILES} Dateien
                </p>
              </div>

              <Button type="button" onClick={() => fileInputRef.current?.click()}>
                <Camera className="h-4 w-4 mr-2" />
                Datei auswählen
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Image Previews */}
      <AnimatePresence>
        {images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-blue-500" />
                  Hochgeladene Fotos ({images.length}/{MAX_FILES})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {images.map((image, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="relative group aspect-square rounded-lg overflow-hidden border-2 border-muted"
                    >
                      <Image
                        src={image.preview}
                        alt={`Upload ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 h-8 w-8 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                        <p className="text-xs text-white truncate">
                          {image.file.name}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Description */}
      {images.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle>Beschreibe deine Fotos</CardTitle>
              <CardDescription>
                Was ist auf den Bildern zu sehen? Was hast du erlebt?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="z.B. Auf diesem Foto sieht man ein seltsames Licht am Himmel über dem Bodensee. Es war etwa 22 Uhr und das Objekt bewegte sich sehr schnell..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[150px] resize-none"
              />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{description.length} Zeichen</span>
                <span className="text-xs">Minimum 20 Zeichen</span>
              </div>

              <Button
                size="lg"
                className="w-full h-14"
                onClick={handleContinue}
                disabled={images.length === 0 || description.trim().length < 20}
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Weiter zur Bearbeitung →
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
