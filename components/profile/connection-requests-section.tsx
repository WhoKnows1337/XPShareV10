'use client'

/**
 * Connection Requests Section
 *
 * Displays pending incoming connection requests
 * Allows user to Accept or Reject requests
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { UserPlus, Check, X, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ConnectionRequest {
  id: string
  requester_id: string
  status: string
  message: string | null
  similarity_score: number
  created_at: string
  requester: {
    id: string
    username: string
    display_name: string | null
    avatar_url: string | null
    total_xp: number
  }
}

interface ConnectionRequestsSectionProps {
  /**
   * Current user ID
   */
  userId: string

  /**
   * Callback when a request is accepted/rejected
   */
  onRequestHandled?: () => void
}

export function ConnectionRequestsSection({
  userId,
  onRequestHandled
}: ConnectionRequestsSectionProps) {
  const [requests, setRequests] = useState<ConnectionRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    fetchRequests()
  }, [userId])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/connections?status=pending')
      const data = await response.json()

      if (response.ok && data.connections) {
        // Filter to only show incoming requests (where we are the addressee)
        const incomingRequests = data.connections.filter(
          (conn: any) => conn.direction === 'incoming' && conn.status === 'pending'
        )
        setRequests(incomingRequests)
      }
    } catch (err) {
      console.error('Failed to fetch connection requests:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRequest = async (connectionId: string, action: 'accepted' | 'rejected') => {
    try {
      setProcessingId(connectionId)
      const response = await fetch('/api/connections', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          connection_id: connectionId,
          status: action
        })
      })

      if (!response.ok) {
        const data = await response.json()
        alert(data.error || 'Failed to update connection')
        return
      }

      // Remove request from UI
      setRequests(prev => prev.filter(req => req.id !== connectionId))

      // Notify parent
      onRequestHandled?.()
    } catch (err) {
      console.error('Error handling request:', err)
      alert('Failed to process request')
    } finally {
      setProcessingId(null)
    }
  }

  if (loading) {
    return (
      <Card className="mb-6">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (requests.length === 0) {
    return null // Don't show anything if no pending requests
  }

  return (
    <Card className="mb-6 border-primary/50 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <UserPlus className="h-5 w-5 text-primary" />
          Pending Connection Requests
          <Badge variant="secondary">{requests.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AnimatePresence mode="popLayout">
          {requests.map((request) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-4 p-4 rounded-lg border bg-card"
            >
              {/* Avatar */}
              <Avatar className="h-12 w-12 flex-shrink-0">
                <AvatarImage src={request.requester.avatar_url || ''} />
                <AvatarFallback>
                  {(request.requester.display_name || request.requester.username || 'U')[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold truncate">
                  {request.requester.display_name || request.requester.username}
                </h4>
                <p className="text-sm text-muted-foreground truncate">
                  @{request.requester.username}
                </p>
                {request.similarity_score > 0 && (
                  <p className="text-xs text-primary mt-1">
                    {Math.round(request.similarity_score * 100)}% similarity
                  </p>
                )}
                {request.message && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    "{request.message}"
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 flex-shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-green-600 hover:bg-green-50 hover:text-green-700 hover:border-green-300"
                  onClick={() => handleRequest(request.id, 'accepted')}
                  disabled={processingId === request.id}
                >
                  {processingId === request.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Accept
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                  onClick={() => handleRequest(request.id, 'rejected')}
                  disabled={processingId === request.id}
                >
                  {processingId === request.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <X className="h-4 w-4 mr-1" />
                      Reject
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
