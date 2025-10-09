'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getLocaleFromPathname } from '@/lib/utils/locale'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Rocket, Loader2 } from 'lucide-react'
import { useSubmit3Store } from '@/lib/stores/submit3Store'
import { PrivacyControls, type PrivacySettings } from '@/components/submit3/PrivacyControls'
import { ExperiencePreview } from '@/components/submit3/ExperiencePreview'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function Submit3PrivacyPage() {
  const router = useRouter()
  const pathname = usePathname()
  const locale = getLocaleFromPathname(pathname)

  const {
    originalContent,
    enhancedContent,
    confirmedCategory,
    confirmedLocation,
    confirmedTime,
    confirmedTags,
    witnesses,
    mediaFiles,
    privacy,
    setPrivacy,
    reset,
  } = useSubmit3Store()

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    visibility: privacy.visibility,
    anonymous: privacy.anonymous,
    locationPrecision: privacy.locationPrecision,
    allowComments: privacy.allowComments,
    allowReactions: privacy.allowReactions,
    notifyWitnesses: privacy.notifyWitnesses,
  })

  const [isPublishing, setIsPublishing] = useState(false)

  // Redirect if no content
  useEffect(() => {
    if (!originalContent || originalContent.length < 50) {
      router.push(`/${locale}/submit3/compose`)
    }
  }, [originalContent, router, locale])

  // Sync privacy settings to store
  useEffect(() => {
    setPrivacy(privacySettings)
  }, [privacySettings, setPrivacy])

  const handlePublish = async () => {
    setIsPublishing(true)

    try {
      // Prepare submission data
      const submissionData = {
        content: enhancedContent || originalContent,
        originalContent,
        category: confirmedCategory,
        location: confirmedLocation
          ? {
              name: confirmedLocation.name,
              coordinates: confirmedLocation.coordinates,
              accuracy: privacySettings.locationPrecision,
            }
          : undefined,
        time: confirmedTime,
        tags: confirmedTags,
        witnesses: witnesses.map((w) => ({
          name: w.name,
          email: w.email,
          shouldNotify: privacySettings.notifyWitnesses && w.invite,
        })),
        mediaFiles: mediaFiles.map((m) => ({
          id: m.id,
          type: m.type,
          size: m.size,
          // In real implementation, files would be uploaded to storage first
        })),
        privacy: privacySettings,
      }

      console.log('📤 Publishing submission:', submissionData)

      // Simulate API call (replace with actual API)
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // TODO: Replace with actual API call
      // const response = await fetch('/api/experiences', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(submissionData),
      // })
      // const result = await response.json()

      // Navigate to success page
      router.push(`/${locale}/submit3/success`)

      // Reset store after successful submission
      setTimeout(() => reset(), 1000)
    } catch (error) {
      console.error('❌ Publishing failed:', error)
      setIsPublishing(false)
      // TODO: Show error toast/notification
    }
  }

  const handleBack = () => {
    router.push(`/${locale}/submit3/enhance`)
  }

  if (!originalContent) return null

  const finalContent = enhancedContent || originalContent

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Privacy & Publish</h1>
        <p className="text-muted-foreground">
          Final step: Configure privacy and preview before publishing
        </p>
      </div>

      {/* Mobile: Tabs */}
      <div className="lg:hidden">
        <Tabs defaultValue="settings" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="mt-6">
            <PrivacyControls settings={privacySettings} onChange={setPrivacySettings} />
          </TabsContent>

          <TabsContent value="preview" className="mt-6">
            <ExperiencePreview
              content={finalContent}
              category={confirmedCategory || undefined}
              location={confirmedLocation?.name || undefined}
              time={confirmedTime || undefined}
              tags={confirmedTags}
              witnesses={witnesses}
              mediaCount={mediaFiles.length}
              privacySettings={privacySettings}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Desktop: Side-by-side */}
      <div className="hidden lg:grid lg:grid-cols-2 lg:gap-8">
        {/* Left: Privacy Controls */}
        <div>
          <PrivacyControls settings={privacySettings} onChange={setPrivacySettings} />
        </div>

        {/* Right: Preview */}
        <div className="sticky top-8 h-fit">
          <ExperiencePreview
            content={finalContent}
            category={confirmedCategory || undefined}
            location={confirmedLocation?.name || undefined}
            time={confirmedTime || undefined}
            tags={confirmedTags}
            witnesses={witnesses}
            mediaCount={mediaFiles.length}
            privacySettings={privacySettings}
          />
        </div>
      </div>

      {/* Publish Button */}
      <div className="flex gap-4 sticky bottom-0 bg-background py-4 border-t">
        <Button variant="outline" onClick={handleBack} className="flex-1" size="lg">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={handlePublish}
          disabled={isPublishing}
          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          size="lg"
        >
          {isPublishing ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Publishing...
            </>
          ) : (
            <>
              <Rocket className="mr-2 h-5 w-5" />
              Publish Experience
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
