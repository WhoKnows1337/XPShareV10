'use client'

import { DraftsTab } from './drafts-tab'

export function PrivateTab({ userId }: { userId: string }) {
  return <DraftsTab userId={userId} />
}
