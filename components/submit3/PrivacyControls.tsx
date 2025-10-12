'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Eye,
  EyeOff,
  Globe,
  Lock,
  Link2,
  User,
  UserX,
  MapPin,
  MessageSquare,
  Heart,
  Bell,
  Shield,
} from 'lucide-react'
import { motion } from 'framer-motion'

export interface PrivacySettings {
  visibility: 'public' | 'unlisted' | 'private'
  anonymous: boolean
  locationPrecision: 'exact' | 'approximate' | 'country' | 'hidden'
  allowComments: boolean
  allowReactions: boolean
  notifyWitnesses: boolean
}

interface PrivacyControlsProps {
  settings: PrivacySettings
  onChange: (settings: PrivacySettings) => void
}

export function PrivacyControls({ settings, onChange }: PrivacyControlsProps) {
  const updateSetting = <K extends keyof PrivacySettings>(
    key: K,
    value: PrivacySettings[K]
  ) => {
    onChange({ ...settings, [key]: value })
  }

  return (
    <div className="space-y-6">
      {/* Visibility */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe className="h-5 w-5 text-purple-500" />
            Visibility
          </CardTitle>
          <CardDescription>Who can see your experience?</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={settings.visibility}
            onValueChange={(value: any) => updateSetting('visibility', value)}
          >
            <motion.div
              whileHover={{ x: 4 }}
              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <RadioGroupItem value="private" id="private" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="private" className="cursor-pointer">
                  <div className="flex items-center gap-2 mb-1">
                    <Lock className="h-4 w-4 text-red-600" />
                    <span className="font-semibold">Private</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Only you can view this experience
                  </p>
                </Label>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ x: 4 }}
              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <RadioGroupItem value="public" id="public" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="public" className="cursor-pointer">
                  <div className="flex items-center gap-2 mb-1">
                    <Eye className="h-4 w-4 text-green-600" />
                    <span className="font-semibold">Public</span>
                    <Badge variant="secondary" className="text-xs">
                      Recommended
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Anyone can find and view your experience
                  </p>
                </Label>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ x: 4 }}
              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <RadioGroupItem value="unlisted" id="unlisted" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="unlisted" className="cursor-pointer">
                  <div className="flex items-center gap-2 mb-1">
                    <Link2 className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold">Unlisted</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Only people with the link can view
                  </p>
                </Label>
              </div>
            </motion.div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Author Identity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-500" />
            Author Identity
          </CardTitle>
          <CardDescription>How do you want to appear?</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="flex items-center gap-3">
              {settings.anonymous ? (
                <UserX className="h-5 w-5 text-gray-600" />
              ) : (
                <User className="h-5 w-5 text-purple-600" />
              )}
              <div>
                <p className="font-semibold">
                  {settings.anonymous ? 'Post Anonymously' : 'Show Your Name'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {settings.anonymous
                    ? 'Your identity will be hidden'
                    : 'Your profile will be visible'}
                </p>
              </div>
            </div>
            <Switch
              checked={settings.anonymous}
              onCheckedChange={(checked) => updateSetting('anonymous', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Interaction Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-purple-500" />
            Interaction Settings
          </CardTitle>
          <CardDescription>Control how others can interact</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-4 w-4 text-blue-600" />
              <div>
                <p className="font-medium">Allow Comments</p>
                <p className="text-sm text-muted-foreground">
                  Others can share their thoughts
                </p>
              </div>
            </div>
            <Switch
              checked={settings.allowComments}
              onCheckedChange={(checked) => updateSetting('allowComments', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center gap-3">
              <Heart className="h-4 w-4 text-pink-600" />
              <div>
                <p className="font-medium">Allow Reactions</p>
                <p className="text-sm text-muted-foreground">
                  Others can react with emojis
                </p>
              </div>
            </div>
            <Switch
              checked={settings.allowReactions}
              onCheckedChange={(checked) => updateSetting('allowReactions', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center gap-3">
              <Bell className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="font-medium">Notify Witnesses</p>
                <p className="text-sm text-muted-foreground">
                  Send email invites to witnesses
                </p>
              </div>
            </div>
            <Switch
              checked={settings.notifyWitnesses}
              onCheckedChange={(checked) => updateSetting('notifyWitnesses', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
