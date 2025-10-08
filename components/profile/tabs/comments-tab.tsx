'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { MessageSquare, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { createClient } from '@/lib/supabase/client'

interface Comment {
  id: string
  content: string
  created_at: string
  experience: {
    id: string
    title: string
    category: string
  }
}

interface CommentsTabProps {
  userId: string
}

export function CommentsTab({ userId }: CommentsTabProps) {
  const { data: comments, isLoading } = useQuery({
    queryKey: ['user-comments', userId],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          experience:experiences (
            id,
            title,
            category
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      return data as Comment[]
    },
  })

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-3/4 mx-auto" />
            <div className="h-4 bg-muted rounded w-1/2 mx-auto" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!comments || comments.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="font-semibold mb-2">No Comments Yet</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Start engaging with the community by commenting on experiences
          </p>
          <Link href="/feed">
            <Button>Explore Experiences</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  // Group comments by experience
  const grouped = comments.reduce(
    (acc, comment) => {
      const expId = comment.experience.id
      if (!acc[expId]) {
        acc[expId] = {
          experience: comment.experience,
          comments: [],
        }
      }
      acc[expId].comments.push(comment)
      return acc
    },
    {} as Record<string, { experience: any; comments: Comment[] }>
  )

  return (
    <div className="space-y-6">
      {Object.values(grouped).map(({ experience, comments }) => (
        <Card key={experience.id}>
          <CardContent className="pt-6">
            {/* Experience Header */}
            <div className="flex items-start justify-between mb-4 pb-4 border-b">
              <div className="flex-1 min-w-0">
                <Link
                  href={`/experiences/${experience.id}`}
                  className="font-semibold hover:text-primary transition-colors truncate block"
                >
                  {experience.title}
                </Link>
                <p className="text-xs text-muted-foreground mt-1">{experience.category}</p>
              </div>
              <Link href={`/experiences/${experience.id}#comments`}>
                <Button size="sm" variant="ghost">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Comments */}
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="pl-4 border-l-2 border-muted">
                  <p className="text-sm mb-2">{comment.content}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
