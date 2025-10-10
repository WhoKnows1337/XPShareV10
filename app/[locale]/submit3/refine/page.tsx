'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getLocaleFromPathname } from '@/lib/utils/locale'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, Sparkles, MapPin, Clock, Tag as TagIcon, Folder } from 'lucide-react'
import { useSubmit3Store } from '@/lib/stores/submit3Store'
import { MetadataCard } from '@/components/submit3/MetadataCard'
import { CategoryEditor } from '@/components/submit3/CategoryEditor'
import { TimeEditor } from '@/components/submit3/TimeEditor'
import { TagEditor } from '@/components/submit3/TagEditor'
import { LocationPicker } from '@/components/submit/LocationPicker'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { motion } from 'framer-motion'

export default function Submit3RefinePage() {
  const router = useRouter()
  const pathname = usePathname()

  const {
    originalContent,
    analysis,
    setConfirmedCategory,
    setConfirmedLocation,
    setConfirmedTime,
    setConfirmedTags,
    confirmedCategory,
    confirmedLocation,
    confirmedTime,
    confirmedTags,
  } = useSubmit3Store()

  const [showCategoryEditor, setShowCategoryEditor] = useState(false)
  const [showLocationEditor, setShowLocationEditor] = useState(false)
  const [showTimeEditor, setShowTimeEditor] = useState(false)
  const [showTagEditor, setShowTagEditor] = useState(false)

  // Local state for editors
  const [tempCategory, setTempCategory] = useState(confirmedCategory || analysis?.category || '')
  const [tempLocation, setTempLocation] = useState(
    confirmedLocation?.name || analysis?.location?.name || ''
  )
  const [tempCoordinates, setTempCoordinates] = useState<{ lat: number; lng: number }>({
    lat: confirmedLocation?.coordinates?.[1] || analysis?.location?.coordinates?.[1] || 0,
    lng: confirmedLocation?.coordinates?.[0] || analysis?.location?.coordinates?.[0] || 0,
  })
  const [tempLocationAccuracy, setTempLocationAccuracy] = useState<number>(1) // 0=exact, 1=~5km, 2=country, 3=hidden
  const [tempTime, setTempTime] = useState(confirmedTime || analysis?.time?.date || '')
  const [tempTags, setTempTags] = useState<string[]>(
    confirmedTags.length > 0 ? confirmedTags : (analysis?.tags || [])
  )

  // Redirect if no content
  useEffect(() => {
    if (!originalContent || originalContent.length < 50) {
      const locale = getLocaleFromPathname(pathname)
      router.push(`/${locale}/submit3/compose`)
    }
  }, [originalContent, router, pathname])

  const handleContinue = () => {
    const locale = getLocaleFromPathname(pathname)
    router.push(`/${locale}/submit3/enrich`)
  }

  const handleBack = () => {
    const locale = getLocaleFromPathname(pathname)
    router.push(`/${locale}/submit3/compose`)
  }

  const handleAcceptAll = () => {
    // Accept all AI suggestions
    if (analysis?.category) setConfirmedCategory(analysis.category)
    if (analysis?.location?.name) {
      setConfirmedLocation({
        name: analysis.location.name,
        coordinates: analysis.location.coordinates || [0, 0],
        accuracy: 'approximate',
      })
    }
    if (analysis?.time?.date) setConfirmedTime(analysis.time.date)
    if (analysis?.tags) setConfirmedTags(analysis.tags)

    handleContinue()
  }

  const accuracyLabels = ['Exact', '~5km', 'Country', 'Hidden']

  if (!originalContent) return null

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Back Button */}
      <Button variant="ghost" onClick={handleBack}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Writing
      </Button>

      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
          <Sparkles className="h-8 w-8 text-purple-500" />
          Review AI-Detected Information
        </h1>
        <p className="text-muted-foreground">
          Confirm or edit what the AI found in your story
        </p>
      </div>

      {/* Quick Accept All */}
      {analysis && !confirmedCategory && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            onClick={handleAcceptAll}
            size="lg"
            variant="outline"
            className="w-full border-2 border-green-500 text-green-700 hover:bg-green-50"
          >
            ✓ Accept All AI Suggestions & Continue
          </Button>
        </motion.div>
      )}

      {/* Metadata Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Category Card */}
        <MetadataCard
          title="Category"
          description="What type of experience was this?"
          icon={<Folder className="h-5 w-5 text-purple-500" />}
          aiValue={analysis?.category || undefined}
          confirmedValue={confirmedCategory || undefined}
          isConfirmed={!!confirmedCategory}
          onEdit={() => setShowCategoryEditor(true)}
          onConfirm={() => {
            if (tempCategory) setConfirmedCategory(tempCategory)
          }}
          delay={0.1}
        />

        {/* Location Card */}
        {(analysis?.location?.name || confirmedLocation) && (
          <MetadataCard
            title="Location"
            description="Where did this happen?"
            icon={<MapPin className="h-5 w-5 text-purple-500" />}
            aiValue={analysis?.location?.name || undefined}
            confirmedValue={confirmedLocation?.name || undefined}
            confidence={analysis?.location?.confidence}
            isConfirmed={!!confirmedLocation}
            onEdit={() => setShowLocationEditor(true)}
            onConfirm={() => {
              if (tempLocation) {
                const accuracyMap = ['exact', 'approximate', 'country', 'hidden'] as const
                setConfirmedLocation({
                  name: tempLocation,
                  coordinates: [tempCoordinates.lng, tempCoordinates.lat],
                  accuracy: accuracyMap[tempLocationAccuracy],
                })
              }
            }}
            delay={0.2}
          >
            {showLocationEditor && (
              <div className="space-y-4 mb-4">
                <LocationPicker
                  value={tempLocation}
                  coordinates={tempCoordinates}
                  onSelect={(loc, coords) => {
                    setTempLocation(loc)
                    setTempCoordinates(coords)
                  }}
                />

                <div>
                  <Label className="mb-3 block">Location Privacy</Label>
                  <Slider
                    value={[tempLocationAccuracy]}
                    onValueChange={(value) => setTempLocationAccuracy(value[0])}
                    max={3}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs mt-2">
                    {accuracyLabels.map((label, idx) => (
                      <span
                        key={label}
                        className={tempLocationAccuracy === idx ? 'text-purple-600 font-semibold' : 'text-muted-foreground'}
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </MetadataCard>
        )}

        {/* Time Card */}
        {(analysis?.time?.date || confirmedTime) && (
          <MetadataCard
            title="Time"
            description="When did this happen?"
            icon={<Clock className="h-5 w-5 text-purple-500" />}
            aiValue={analysis?.time?.date ? new Date(analysis.time.date).toLocaleDateString() : undefined}
            confirmedValue={confirmedTime ? new Date(confirmedTime).toLocaleDateString() : undefined}
            confidence={analysis?.time?.isApproximate ? 0.6 : 0.9}
            isConfirmed={!!confirmedTime}
            onEdit={() => setShowTimeEditor(true)}
            onConfirm={() => {
              if (tempTime) setConfirmedTime(tempTime)
            }}
            delay={0.3}
          >
            {showTimeEditor && (
              <div className="mb-4">
                <TimeEditor
                  value={tempTime}
                  onChange={setTempTime}
                />
              </div>
            )}
          </MetadataCard>
        )}

        {/* Tags Card */}
        {(analysis?.tags.length || confirmedTags.length > 0) && (
          <MetadataCard
            title="Tags"
            description="Keywords describing your experience"
            icon={<TagIcon className="h-5 w-5 text-purple-500" />}
            aiValue={analysis?.tags}
            confirmedValue={confirmedTags.length > 0 ? confirmedTags : undefined}
            isConfirmed={confirmedTags.length > 0}
            onEdit={() => setShowTagEditor(true)}
            onConfirm={() => {
              if (tempTags.length > 0) setConfirmedTags(tempTags)
            }}
            delay={0.4}
          >
            {showTagEditor && (
              <div className="mb-4">
                <TagEditor
                  tags={tempTags}
                  onChange={setTempTags}
                  suggestions={analysis?.tags || []}
                />
              </div>
            )}
          </MetadataCard>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={handleBack}
          className="flex-1"
          size="lg"
        >
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

      {/* Category Editor Dialog */}
      <CategoryEditor
        open={showCategoryEditor}
        onClose={() => setShowCategoryEditor(false)}
        currentCategory={tempCategory}
        onSelect={(category) => {
          setTempCategory(category)
          setConfirmedCategory(category)
        }}
      />
    </div>
  )
}
