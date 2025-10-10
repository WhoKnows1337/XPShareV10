'use client'

import { useRouter, usePathname } from 'next/navigation'
import { getLocaleFromPathname } from '@/lib/utils/locale'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, Paperclip, Users } from 'lucide-react'
import { useSubmit3Store } from '@/lib/stores/submit3Store'
import { MediaUploadZone } from '@/components/submit3/MediaUploadZone'
import { WitnessManager, type Witness } from '@/components/submit3/WitnessManager'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function Submit3AttachPage() {
  const router = useRouter()
  const pathname = usePathname()
  const locale = getLocaleFromPathname(pathname)

  const { mediaFiles, witnesses, addMediaFile, removeMediaFile, addWitness, removeWitness } =
    useSubmit3Store()

  const handleAddFiles = (files: File[]) => {
    files.forEach((file) => {
      const id = `${Date.now()}-${Math.random()}`
      const preview = file.type.startsWith('image/')
        ? URL.createObjectURL(file)
        : ''

      let type: 'image' | 'video' | 'audio' | 'other' = 'other'
      if (file.type.startsWith('image/')) type = 'image'
      else if (file.type.startsWith('video/')) type = 'video'
      else if (file.type.startsWith('audio/')) type = 'audio'

      addMediaFile({
        id,
        file,
        preview,
        type,
        size: file.size,
      })
    })
  }

  const handleContinue = () => {
    router.push(`/${locale}/submit3/enhance`)
  }

  const handleBack = () => {
    router.push(`/${locale}/submit3/enrich`)
  }

  const handleSkip = () => {
    router.push(`/${locale}/submit3/enhance`)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Back & Skip */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button variant="ghost" onClick={handleSkip}>
          Skip This Step →
        </Button>
      </div>

      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Add Media & Witnesses</h1>
        <p className="text-muted-foreground">
          Optional: Enhance your experience with photos, videos, or witness information
        </p>
      </div>

      {/* Tabs: Media vs Witnesses */}
      <Tabs defaultValue="media" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="media" className="flex items-center gap-2">
            <Paperclip className="h-4 w-4" />
            Media ({mediaFiles.length})
          </TabsTrigger>
          <TabsTrigger value="witnesses" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Witnesses ({witnesses.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="media" className="mt-6">
          <MediaUploadZone
            files={mediaFiles}
            onAdd={handleAddFiles}
            onRemove={removeMediaFile}
            maxFiles={10}
            maxSizeMB={50}
          />
        </TabsContent>

        <TabsContent value="witnesses" className="mt-6">
          <WitnessManager
            witnesses={witnesses}
            onAdd={addWitness}
            onRemove={removeWitness}
          />
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button variant="outline" onClick={handleBack} className="flex-1" size="lg">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={handleContinue}
          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          size="lg"
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
