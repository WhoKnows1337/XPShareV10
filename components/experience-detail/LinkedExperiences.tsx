'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Users, Plus } from 'lucide-react'
import { LinkExperienceDialog } from './LinkExperienceDialog'

interface LinkedExperience {
  id: string
  title: string
  category: string
  user_profiles: {
    username: string
    display_name?: string
    avatar_url?: string
  }
}

interface LinkedExperiencesProps {
  experienceId: string
  linkedExperiences: LinkedExperience[]
  isAuthor: boolean
}

export function LinkedExperiences({
  experienceId,
  linkedExperiences,
  isAuthor,
}: LinkedExperiencesProps) {
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false)

  if (linkedExperiences.length === 0 && !isAuthor) {
    return null
  }

  return (
    <section className="mb-8">
      <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold">
        <Users className="h-5 w-5" />
        Gemeinsam erlebt ({linkedExperiences.length})
      </h2>

      {linkedExperiences.length > 0 && (
        <div className="grid gap-4">
          {linkedExperiences.map((linked) => {
            const displayName =
              linked.user_profiles.display_name || linked.user_profiles.username
            const initials = displayName.substring(0, 2).toUpperCase()

            return (
              <Card key={linked.id} className="p-4">
                <div className="flex items-start gap-3">
                  <Link href={`/@${linked.user_profiles.username}`}>
                    <Avatar className="h-10 w-10">
                      {linked.user_profiles.avatar_url && (
                        <AvatarImage src={linked.user_profiles.avatar_url} />
                      )}
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <Link
                        href={`/@${linked.user_profiles.username}`}
                        className="font-semibold hover:underline"
                      >
                        @{linked.user_profiles.username}
                      </Link>
                      <Badge variant="secondary" className="text-xs">
                        Zeuge
                      </Badge>
                    </div>
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {linked.title}
                    </p>
                    <Button variant="link" className="mt-2 h-auto p-0" asChild>
                      <Link href={`/experiences/${linked.id}`}>
                        Perspektive lesen →
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {isAuthor && (
        <>
          <Button
            variant="outline"
            className="mt-4 w-full"
            onClick={() => setIsLinkDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Link Similar Experience
          </Button>

          <LinkExperienceDialog
            experienceId={experienceId}
            open={isLinkDialogOpen}
            onOpenChange={setIsLinkDialogOpen}
          />
        </>
      )}
    </section>
  )
}
