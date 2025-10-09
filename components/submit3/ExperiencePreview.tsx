'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  MapPin,
  Clock,
  Tag,
  Folder,
  User,
  Users,
  Eye,
  Paperclip,
  UserX,
} from 'lucide-react'
import { motion } from 'framer-motion'
import type { PrivacySettings } from './PrivacyControls'
import type { Witness } from './WitnessManager'

interface ExperiencePreviewProps {
  content: string
  category?: string
  location?: string
  time?: string
  tags?: string[]
  witnesses?: Witness[]
  mediaCount?: number
  privacySettings: PrivacySettings
}

export function ExperiencePreview({
  content,
  category,
  location,
  time,
  tags = [],
  witnesses = [],
  mediaCount = 0,
  privacySettings,
}: ExperiencePreviewProps) {
  const formatLocation = (loc: string) => {
    switch (privacySettings.locationPrecision) {
      case 'exact':
        return loc
      case 'approximate':
        return `Near ${loc}`
      case 'country':
        return loc.split(',').pop()?.trim() || loc
      case 'hidden':
        return null
      default:
        return loc
    }
  }

  const displayLocation = location ? formatLocation(location) : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Preview Header */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Eye className="h-4 w-4" />
        <span>Preview - How others will see your experience</span>
      </div>

      {/* Main Experience Card */}
      <Card className="border-2 shadow-lg">
        <CardHeader>
          {/* Author Info */}
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                {privacySettings.anonymous ? (
                  <UserX className="h-5 w-5" />
                ) : (
                  <User className="h-5 w-5" />
                )}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">
                {privacySettings.anonymous ? 'Anonymous User' : 'Your Name'}
              </p>
              <p className="text-xs text-muted-foreground">
                {time ? new Date(time).toLocaleDateString() : 'Just now'}
              </p>
            </div>
          </div>

          {/* Category & Metadata */}
          <div className="flex flex-wrap gap-2 mb-3">
            {category && (
              <Badge variant="default" className="flex items-center gap-1">
                <Folder className="h-3 w-3" />
                {category}
              </Badge>
            )}

            {displayLocation && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {displayLocation}
              </Badge>
            )}

            {time && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(time).toLocaleDateString()}
              </Badge>
            )}

            {mediaCount > 0 && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Paperclip className="h-3 w-3" />
                {mediaCount} {mediaCount === 1 ? 'file' : 'files'}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Main Content */}
          <div className="prose prose-sm max-w-none">
            <p className="text-base leading-relaxed whitespace-pre-wrap">{content}</p>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <>
              <Separator />
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </>
          )}

          {/* Witnesses */}
          {witnesses.length > 0 && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Witnesses ({witnesses.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {witnesses.map((witness, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {witness.name}
                      {witness.detectedFromText && ' (AI-detected)'}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Interaction Indicators */}
          <Separator />
          <div className="flex gap-4 text-sm text-muted-foreground">
            {privacySettings.allowReactions && (
              <span className="flex items-center gap-1">
                👍 0 reactions
              </span>
            )}
            {privacySettings.allowComments && (
              <span className="flex items-center gap-1">
                💬 0 comments
              </span>
            )}
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {privacySettings.visibility === 'public'
                ? 'Public'
                : privacySettings.visibility === 'unlisted'
                ? 'Unlisted'
                : 'Private'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Notice */}
      {privacySettings.visibility !== 'public' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
        >
          <p className="text-sm text-yellow-900">
            {privacySettings.visibility === 'private' && (
              <>
                🔒 <strong>Private:</strong> Only you can see this experience.
              </>
            )}
            {privacySettings.visibility === 'unlisted' && (
              <>
                🔗 <strong>Unlisted:</strong> Only people with the link can see this
                experience.
              </>
            )}
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}
