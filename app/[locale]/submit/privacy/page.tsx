'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Eye,
  EyeOff,
  MapPin,
  Lock,
  Globe,
  UserCheck,
  Info,
  Bell,
  MessageSquare,
  Tag as TagIcon,
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

type Visibility = 'public' | 'anonymous' | 'private'
type LocationPrivacy = 'exact' | 'approximate' | 'country' | 'hidden'
type NotificationFrequency = 'instant' | 'daily' | 'weekly' | 'never'

export default function PrivacyPage() {
  const router = useRouter()
  const [visibility, setVisibility] = useState<Visibility>('public')
  const [locationPrivacy, setLocationPrivacy] = useState<LocationPrivacy>('approximate')
  const [allowComments, setAllowComments] = useState(true)
  const [allowTagging, setAllowTagging] = useState(true)
  const [notifyOnSimilar, setNotifyOnSimilar] = useState(false)
  const [notificationFrequency, setNotificationFrequency] = useState<NotificationFrequency>('daily')

  useEffect(() => {
    // Check if draft exists
    const draft = localStorage.getItem('experience_draft')
    if (!draft) {
      router.push('/submit')
    }
  }, [router])

  const handlePublish = async () => {
    try {
      // Get draft data
      const draft = JSON.parse(localStorage.getItem('experience_draft') || '{}')

      // Prepare final submission
      const submission = {
        ...draft,
        privacy: {
          visibility,
          locationPrivacy,
          allowComments,
          allowTagging,
          notifyOnSimilar,
          notificationFrequency,
        },
      }

      // Save to localStorage for final screen
      localStorage.setItem('experience_draft', JSON.stringify(submission))

      // Navigate to final submission
      router.push('/submit/final')
    } catch (error) {
      console.error('Privacy settings error:', error)
    }
  }

  const visibilityOptions = [
    {
      value: 'public' as Visibility,
      icon: Globe,
      title: 'Public',
      description: 'Everyone can see this with your name',
      features: ['✓ Appears in search', '✓ Shown in timeline', '✓ Included in statistics'],
    },
    {
      value: 'anonymous' as Visibility,
      icon: UserCheck,
      title: 'Anonymous',
      description: 'Everyone can see this WITHOUT your name',
      features: [
        '✓ Appears in search',
        '✓ Shown in timeline',
        '✓ Included in statistics',
        '✓ Shows "Anonymous ✓" badge',
      ],
    },
    {
      value: 'private' as Visibility,
      icon: Lock,
      title: 'Private',
      description: 'Only you can see this',
      features: ['✗ Not in search', '✗ Not in timeline', '⚠️ Limited statistics'],
    },
  ]

  const locationOptions = [
    {
      value: 'exact' as LocationPrivacy,
      title: 'Exact Location',
      description: 'GPS coordinates visible',
      example: '47.6516°N, 9.1829°E',
    },
    {
      value: 'approximate' as LocationPrivacy,
      title: 'Approximate (Recommended)',
      description: '~50km radius',
      example: '"Bodensee Region"',
    },
    {
      value: 'country' as LocationPrivacy,
      title: 'Country Only',
      description: 'Country-level only',
      example: '"Germany"',
    },
    {
      value: 'hidden' as LocationPrivacy,
      title: 'Hidden',
      description: 'No location shown',
      example: 'Location not disclosed',
    },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">🔒 Privacy & Publishing</h1>
        <p className="text-muted-foreground">
          Choose how you want to share your experience
        </p>
      </div>

      <div className="space-y-6">
        {/* Visibility */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-purple-500" />
              Who can see your experience?
            </CardTitle>
            <CardDescription>
              Choose your preferred visibility level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={visibility} onValueChange={(v) => setVisibility(v as Visibility)}>
              <div className="space-y-3">
                {visibilityOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`relative flex items-start p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      visibility === option.value
                        ? 'border-purple-500 bg-purple-500/5'
                        : 'border-border hover:border-purple-300'
                    }`}
                    onClick={() => setVisibility(option.value)}
                  >
                    <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                    <div className="ml-4 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <option.icon className="h-5 w-5" />
                        <Label
                          htmlFor={option.value}
                          className="font-semibold cursor-pointer"
                        >
                          {option.title}
                        </Label>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {option.description}
                      </p>
                      <ul className="text-xs text-muted-foreground space-y-0.5">
                        {option.features.map((feature, i) => (
                          <li key={i}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </RadioGroup>

            {visibility === 'anonymous' && (
              <Alert className="mt-4">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Your experience will show as "Anonymous ✓" (verified account) to maintain
                  credibility while protecting your identity.
                </AlertDescription>
              </Alert>
            )}

            {visibility === 'private' && (
              <Alert className="mt-4 border-amber-500/50 bg-amber-500/10">
                <Info className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-600">
                  Private experiences won't contribute to pattern discovery and community insights.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Location Privacy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-500" />
              Location Privacy
            </CardTitle>
            <CardDescription>
              How precisely do you want to share your location?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={locationPrivacy}
              onValueChange={(v) => setLocationPrivacy(v as LocationPrivacy)}
            >
              <div className="space-y-2">
                {locationOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                      locationPrivacy === option.value
                        ? 'border-green-500 bg-green-500/5'
                        : 'border-border hover:border-green-300'
                    }`}
                    onClick={() => setLocationPrivacy(option.value)}
                  >
                    <RadioGroupItem value={option.value} id={`loc-${option.value}`} />
                    <div className="ml-3 flex-1">
                      <Label
                        htmlFor={`loc-${option.value}`}
                        className="font-medium cursor-pointer"
                      >
                        {option.title}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {option.description} · {option.example}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </RadioGroup>

            {locationPrivacy === 'hidden' && (
              <Alert className="mt-4 border-amber-500/50 bg-amber-500/10">
                <Info className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-600">
                  Hidden location will prevent geographic pattern matching.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Additional Options */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Settings</CardTitle>
            <CardDescription>
              Configure interaction and notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Allow Comments */}
            <div className="flex items-start space-x-3 p-3 rounded-lg border">
              <Checkbox
                id="comments"
                checked={allowComments}
                onCheckedChange={(checked) => setAllowComments(checked as boolean)}
              />
              <div className="flex-1">
                <Label htmlFor="comments" className="font-medium cursor-pointer flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Allow comments
                </Label>
                <p className="text-sm text-muted-foreground">
                  Others can comment on your experience
                </p>
              </div>
            </div>

            {/* Allow Tagging */}
            <div className="flex items-start space-x-3 p-3 rounded-lg border">
              <Checkbox
                id="tagging"
                checked={allowTagging}
                onCheckedChange={(checked) => setAllowTagging(checked as boolean)}
              />
              <div className="flex-1">
                <Label htmlFor="tagging" className="font-medium cursor-pointer flex items-center gap-2">
                  <TagIcon className="h-4 w-4" />
                  Allow similar experience tagging
                </Label>
                <p className="text-sm text-muted-foreground">
                  Others can tag their experiences as similar to yours
                </p>
              </div>
            </div>

            {/* Notify on Similar */}
            <div className="flex items-start space-x-3 p-3 rounded-lg border">
              <Checkbox
                id="notify"
                checked={notifyOnSimilar}
                onCheckedChange={(checked) => setNotifyOnSimilar(checked as boolean)}
              />
              <div className="flex-1">
                <Label htmlFor="notify" className="font-medium cursor-pointer flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notify me about similar experiences
                </Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when others report similar experiences
                </p>
              </div>
            </div>

            {/* Notification Frequency */}
            {notifyOnSimilar && (
              <div className="ml-9 space-y-2">
                <Label htmlFor="frequency" className="text-sm">
                  Notification frequency
                </Label>
                <Select
                  value={notificationFrequency}
                  onValueChange={(v) => setNotificationFrequency(v as NotificationFrequency)}
                >
                  <SelectTrigger id="frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instant">Instant</SelectItem>
                    <SelectItem value="daily">Daily digest</SelectItem>
                    <SelectItem value="weekly">Weekly summary</SelectItem>
                    <SelectItem value="never">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Privacy Summary */}
        <Card className="border-purple-500/50 bg-purple-500/5">
          <CardHeader>
            <CardTitle className="text-base">Privacy Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Visibility:</dt>
                <dd className="font-medium capitalize">{visibility}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Location:</dt>
                <dd className="font-medium capitalize">{locationPrivacy.replace('_', ' ')}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Comments:</dt>
                <dd className="font-medium">{allowComments ? 'Enabled' : 'Disabled'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Notifications:</dt>
                <dd className="font-medium">{notifyOnSimilar ? notificationFrequency : 'Disabled'}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button onClick={() => router.back()} variant="outline" className="flex-1" size="lg">
            ← Back
          </Button>
          <Button onClick={handlePublish} className="flex-1" size="lg">
            Continue to Review →
          </Button>
        </div>
      </div>
    </div>
  )
}
