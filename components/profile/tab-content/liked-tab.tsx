'use client'

import { ExperiencesTab } from './experiences-tab'

export function LikedTab({ userId, isOwnProfile }: { userId: string; isOwnProfile: boolean }) {
  return <ExperiencesTab userId={userId} isOwnProfile={isOwnProfile} />
}
