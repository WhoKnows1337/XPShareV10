'use client'

import { Button } from '@/components/ui/button'
import { UserPlus, MessageCircle, Share2 } from 'lucide-react'

interface MobileActionBarProps {
  onConnect?: () => void
  onMessage?: () => void
  onShare?: () => void
  isOwnProfile?: boolean
}

export function MobileActionBar({
  onConnect,
  onMessage,
  onShare,
  isOwnProfile = false,
}: MobileActionBarProps) {
  if (isOwnProfile) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 md:hidden z-50">
      <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
        {onConnect && (
          <Button size="lg" className="min-h-[48px]" onClick={onConnect}>
            <UserPlus className="mr-2 h-5 w-5" />
            Connect
          </Button>
        )}
        {onMessage && (
          <Button size="lg" variant="outline" className="min-h-[48px]" onClick={onMessage}>
            <MessageCircle className="mr-2 h-5 w-5" />
            Message
          </Button>
        )}
      </div>
    </div>
  )
}
