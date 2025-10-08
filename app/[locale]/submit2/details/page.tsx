'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { MapPin, Clock, HelpCircle, Users, ArrowLeft } from 'lucide-react'
import { ProgressBar } from '@/components/submit2/ProgressBar'
import { useSubmit2Store } from '@/lib/stores/submit2Store'
import { LocationPicker } from '@/components/submit/LocationPicker'
import { motion } from 'framer-motion'

export default function Submit2DetailsPage() {
  const router = useRouter()
  const pathname = usePathname()

  const {
    originalContent,
    analysis,
    setConfirmedLocation,
    setConfirmedTime,
    addWitness,
    witnesses,
  } = useSubmit2Store()

  const [location, setLocation] = useState(analysis?.location?.name || '')
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number }>({
    lat: analysis?.location?.coordinates?.[1] || 0,
    lng: analysis?.location?.coordinates?.[0] || 0,
  })
  const [locationAccuracy, setLocationAccuracy] = useState<number>(1) // 0=exact, 1=~5km, 2=country, 3=hidden
  const [time, setTime] = useState(analysis?.time?.date || '')
  const [witnessName, setWitnessName] = useState('')
  const [witnessEmail, setWitnessEmail] = useState('')

  // Redirect if no content
  useEffect(() => {
    if (!originalContent || originalContent.length < 50) {
      const locale = pathname.split('/')[1]
      router.push(`/${locale}/submit2/compose`)
    }
  }, [originalContent, router, pathname])

  const handleLocationSelect = (loc: string, coords: { lat: number; lng: number }) => {
    setLocation(loc)
    setCoordinates(coords)
  }

  const handleAddWitness = () => {
    if (witnessName.trim()) {
      addWitness({
        name: witnessName,
        email: witnessEmail || undefined,
        invite: !!witnessEmail,
        detectedFromText: false,
      })
      setWitnessName('')
      setWitnessEmail('')
    }
  }

  const handleContinue = () => {
    // Save confirmed details
    const accuracyMap = ['exact', 'approximate', 'country', 'hidden'] as const
    setConfirmedLocation({
      name: location,
      coordinates: [coordinates.lng, coordinates.lat],
      accuracy: accuracyMap[locationAccuracy],
    })
    setConfirmedTime(time)

    const locale = pathname.split('/')[1]
    router.push(`/${locale}/submit2/preview`)
  }

  const handleSkip = () => {
    const locale = pathname.split('/')[1]
    router.push(`/${locale}/submit2/preview`)
  }

  if (!originalContent) {
    return null
  }

  const accuracyLabels = ['Exact', '~5km', 'Country', 'Hidden']

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => {
          const locale = pathname.split('/')[1]
          router.push(`/${locale}/submit2/compose`)
        }}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Story
      </Button>

      {/* Progress Bar */}
      <div className="mb-8">
        <ProgressBar currentStep={2} />
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">💡 A few more details</h1>
        <p className="text-muted-foreground">
          All optional - we've pre-filled what we detected from your story
        </p>
      </div>

      <div className="space-y-6">
        {/* Location Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-purple-500" />
                Location
              </CardTitle>
              <CardDescription>
                {analysis?.location?.name
                  ? `AI detected: ${analysis.location.name} ✓`
                  : 'Where did this happen?'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <LocationPicker
                value={location}
                coordinates={coordinates}
                onSelect={handleLocationSelect}
              />

              <div>
                <Label className="mb-3 block">Location Privacy</Label>
                <div className="space-y-3">
                  <Slider
                    value={[locationAccuracy]}
                    onValueChange={(value) => setLocationAccuracy(value[0])}
                    max={3}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm">
                    {accuracyLabels.map((label, idx) => (
                      <span
                        key={label}
                        className={locationAccuracy === idx ? 'text-purple-600 font-semibold' : 'text-muted-foreground'}
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Time Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-500" />
                When
              </CardTitle>
              <CardDescription>
                {analysis?.time?.date
                  ? `AI detected: ${analysis.time.date} ✓`
                  : 'When did this happen?'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTime(new Date().toISOString().split('T')[0])}
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const yesterday = new Date()
                    yesterday.setDate(yesterday.getDate() - 1)
                    setTime(yesterday.toISOString().split('T')[0])
                  }}
                >
                  Yesterday
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const week = new Date()
                    week.setDate(week.getDate() - 7)
                    setTime(week.toISOString().split('T')[0])
                  }}
                >
                  Last Week
                </Button>
              </div>

              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Witnesses Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-500" />
                Witnesses
              </CardTitle>
              <CardDescription>
                Were there other people present?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {witnesses.length > 0 && (
                <div className="space-y-2">
                  {witnesses.map((witness, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg">
                      <Users className="h-4 w-4 text-purple-600" />
                      <span className="flex-1">{witness.name}</span>
                      {witness.email && <Badge variant="outline">Invited</Badge>}
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <Label>Name</Label>
                  <Input
                    placeholder="Witness name"
                    value={witnessName}
                    onChange={(e) => setWitnessName(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Email (optional)</Label>
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    value={witnessEmail}
                    onChange={(e) => setWitnessEmail(e.target.value)}
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={handleAddWitness}
                  disabled={!witnessName.trim()}
                  className="w-full"
                >
                  + Add Witness
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <HelpCircle className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-purple-900">
                    All details are optional
                  </p>
                  <p className="text-sm text-purple-700">
                    You can skip any field. The AI has already extracted key information
                    from your story.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <Button
            variant="outline"
            onClick={handleSkip}
            className="flex-1"
            size="lg"
          >
            Skip Remaining
          </Button>
          <Button
            onClick={handleContinue}
            className="flex-1"
            size="lg"
          >
            Preview & Publish →
          </Button>
        </div>
      </div>
    </div>
  )
}
