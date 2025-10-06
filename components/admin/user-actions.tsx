'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Shield, ShieldOff } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface UserActionsProps {
  userId: string
  isAdmin: boolean
}

export function UserActions({ userId, isAdmin }: UserActionsProps) {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleToggleAdmin = async () => {
    const action = isAdmin ? 'remove admin access' : 'grant admin access'

    if (!confirm(`Are you sure you want to ${action} for this user?`)) {
      return
    }

    setIsProcessing(true)

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_admin: !isAdmin }),
      })

      if (response.ok) {
        toast.success(isAdmin ? 'Admin access removed' : 'Admin access granted')
        router.refresh()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to update user')
      }
    } catch (error) {
      console.error('Toggle admin error:', error)
      toast.error('Failed to update user')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={isAdmin ? 'destructive' : 'default'}
        size="sm"
        onClick={handleToggleAdmin}
        disabled={isProcessing}
        className="gap-2"
      >
        {isAdmin ? (
          <>
            <ShieldOff className="h-4 w-4" />
            Remove Admin
          </>
        ) : (
          <>
            <Shield className="h-4 w-4" />
            Make Admin
          </>
        )}
      </Button>
    </div>
  )
}
