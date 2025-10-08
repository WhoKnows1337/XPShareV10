'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { MessageCircle, Trash2, Send, Reply, ChevronDown, ChevronUp } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'

interface Comment {
  id: string
  content: string
  created_at: string
  user_id: string
  parent_id: string | null
  reply_count: number
  user_profiles: {
    id: string
    username: string
    display_name: string
    avatar_url?: string
  }
}

interface CommentsSectionProps {
  experienceId: string
  currentUserId?: string
}

export function CommentsSection({ experienceId, currentUserId }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchComments()
  }, [experienceId])

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/comments?experienceId=${experienceId}`)
      const data = await response.json()
      setComments(data.comments || [])
    } catch (error) {
      console.error('Failed to fetch comments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experienceId,
          content: newComment.trim(),
          parentId: null,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // Optimistic update - add comment immediately
        setComments((prev) => [...prev, data.comment])
        setNewComment('')
      }
    } catch (error) {
      console.error('Failed to post comment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReply = async (parentId: string) => {
    if (!replyContent.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experienceId,
          content: replyContent.trim(),
          parentId,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // Optimistic update - add reply immediately
        setComments((prev) => [...prev, data.comment])
        setReplyContent('')
        setReplyTo(null)
        // Expand replies to show the new reply
        setExpandedReplies((prev) => new Set(prev).add(parentId))
      }
    } catch (error) {
      console.error('Failed to post reply:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (commentId: string) => {
    try {
      // Optimistic update - remove immediately
      setComments((prev) => prev.filter((c) => c.id !== commentId))

      const response = await fetch(`/api/comments?commentId=${commentId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        console.error('Failed to delete comment')
        // Rollback on error - refetch
        fetchComments()
      }
    } catch (error) {
      console.error('Failed to delete comment:', error)
      // Rollback on error - refetch
      fetchComments()
    }
  }

  const toggleReplies = (commentId: string) => {
    setExpandedReplies((prev) => {
      const next = new Set(prev)
      if (next.has(commentId)) {
        next.delete(commentId)
      } else {
        next.add(commentId)
      }
      return next
    })
  }

  // Separate root comments and replies
  const rootComments = comments.filter((c) => !c.parent_id)
  const getReplies = (parentId: string) =>
    comments.filter((c) => c.parent_id === parentId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

  const renderComment = (comment: Comment, isReply = false) => {
    const profile = comment.user_profiles
    const displayName = profile?.display_name || profile?.username || 'Anonymous'
    const initials = displayName.substring(0, 2).toUpperCase()
    const isOwn = currentUserId === comment.user_id
    const replies = getReplies(comment.id)
    const hasReplies = replies.length > 0
    const isExpanded = expandedReplies.has(comment.id)
    const isReplyingTo = replyTo === comment.id

    return (
      <motion.div
        key={comment.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`${isReply ? 'ml-12' : ''}`}
      >
        <div className="flex gap-3 p-4 rounded-lg border bg-card">
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarFallback className="text-sm">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-medium">{displayName}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.created_at), {
                    addSuffix: true,
                  })}
                </p>
              </div>
              {isOwn && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(comment.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-sm whitespace-pre-wrap mb-3">{comment.content}</p>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {currentUserId && !isReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyTo(isReplyingTo ? null : comment.id)}
                  className="h-8 px-2"
                >
                  <Reply className="h-3 w-3 mr-1" />
                  Reply
                </Button>
              )}

              {hasReplies && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleReplies(comment.id)}
                  className="h-8 px-2"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="h-3 w-3 mr-1" />
                      Hide {comment.reply_count} {comment.reply_count === 1 ? 'reply' : 'replies'}
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3 mr-1" />
                      Show {comment.reply_count} {comment.reply_count === 1 ? 'reply' : 'replies'}
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Reply Form */}
            {isReplyingTo && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3"
              >
                <Textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder={`Reply to ${displayName}...`}
                  className="min-h-[80px]"
                  maxLength={2000}
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">
                    {replyContent.length}/2000
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setReplyTo(null)
                        setReplyContent('')
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      disabled={!replyContent.trim() || isSubmitting}
                      onClick={() => handleReply(comment.id)}
                    >
                      <Send className="h-3 w-3 mr-1" />
                      {isSubmitting ? 'Posting...' : 'Reply'}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Nested Replies */}
        <AnimatePresence>
          {isExpanded && hasReplies && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 space-y-2"
            >
              {replies.map((reply) => renderComment(reply, true))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }

  const totalComments = comments.length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Comments ({totalComments})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Comment Form */}
        {currentUserId && (
          <form onSubmit={handleSubmit} className="space-y-3">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              className="min-h-[100px]"
              maxLength={2000}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {newComment.length}/2000
              </span>
              <Button type="submit" disabled={!newComment.trim() || isSubmitting}>
                <Send className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Posting...' : 'Post Comment'}
              </Button>
            </div>
          </form>
        )}

        {/* Comments List */}
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading comments...</div>
        ) : rootComments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No comments yet. Be the first to share your thoughts!
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {rootComments
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map((comment) => renderComment(comment))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
