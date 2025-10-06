'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Sparkles, ThumbsUp, CheckCircle, ArrowUpCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

interface AIQuestion {
  id: string
  generated_question_text: string
  user_answer: string
  answer_text: string | null
  quality_rating: number | null
  admin_reviewed: boolean
  promoted_to_template: boolean
  generated_at: string
  answered_at: string | null
  dynamic_questions: {
    question_text: string
    question_categories: {
      name: string
      icon: string
    }
  }
}

interface Stats {
  total_generated: number
  total_answered: number
  avg_quality: number
  promoted_count: number
  needs_review: number
}

interface AIQuestionsClientProps {
  initialQuestions: AIQuestion[]
  initialStats: Stats | null
}

export function AIQuestionsClient({
  initialQuestions,
  initialStats,
}: AIQuestionsClientProps) {
  const [questions, setQuestions] = useState(initialQuestions)
  const [stats, setStats] = useState(initialStats)
  const [filter, setFilter] = useState<'all' | 'review' | 'promoted'>('review')
  const [promoteDialog, setPromoteDialog] = useState<{
    open: boolean
    question: AIQuestion | null
    editedText: string
  }>({ open: false, question: null, editedText: '' })
  const { toast } = useToast()
  const router = useRouter()

  const refreshData = async () => {
    const params = new URLSearchParams()
    if (filter === 'review') params.set('needs_review', 'true')
    if (filter === 'promoted') params.set('promoted', 'true')

    const res = await fetch(`/api/admin/ai-questions?${params}`)
    if (res.ok) {
      const { data, stats: newStats } = await res.json()
      setQuestions(data)
      setStats(newStats)
    }
  }

  const handleReview = async (questionId: string, approved: boolean) => {
    try {
      const res = await fetch(`/api/admin/ai-questions/${questionId}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminReviewed: true,
          qualityRating: approved ? 5 : 2,
        }),
      })

      if (!res.ok) throw new Error('Failed to review')

      toast({
        title: 'Success',
        description: `Question ${approved ? 'approved' : 'rejected'}`,
      })

      await refreshData()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update review status',
        variant: 'destructive',
      })
    }
  }

  const openPromoteDialog = (question: AIQuestion) => {
    setPromoteDialog({
      open: true,
      question,
      editedText: question.generated_question_text,
    })
  }

  const handlePromote = async () => {
    if (!promoteDialog.question) return

    try {
      const res = await fetch(
        `/api/admin/ai-questions/${promoteDialog.question.id}/promote`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questionText: promoteDialog.editedText,
          }),
        }
      )

      if (!res.ok) throw new Error('Failed to promote')

      toast({
        title: 'Success',
        description: 'Question promoted to template',
      })

      setPromoteDialog({ open: false, question: null, editedText: '' })
      await refreshData()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to promote question',
        variant: 'destructive',
      })
    }
  }

  const filteredQuestions = questions

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-purple-600" />
          AI-Generated Questions
        </h1>
        <p className="text-muted-foreground mt-2">
          Review and promote high-quality AI-generated follow-up questions
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Generated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_generated}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Answered</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_answered}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Quality</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avg_quality || 'N/A'}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Promoted</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.promoted_count}</div>
            </CardContent>
          </Card>
          <Card className="border-orange-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Needs Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {stats.needs_review}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'review' ? 'default' : 'outline'}
          onClick={() => {
            setFilter('review')
            refreshData()
          }}
        >
          Needs Review ({stats?.needs_review || 0})
        </Button>
        <Button
          variant={filter === 'promoted' ? 'default' : 'outline'}
          onClick={() => {
            setFilter('promoted')
            refreshData()
          }}
        >
          Promoted ({stats?.promoted_count || 0})
        </Button>
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => {
            setFilter('all')
            refreshData()
          }}
        >
          All
        </Button>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No AI-generated questions found
            </CardContent>
          </Card>
        ) : (
          filteredQuestions.map((q) => (
            <Card key={q.id} className="border-purple-100">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{q.dynamic_questions?.question_categories?.icon}</span>
                      <span className="text-sm text-muted-foreground">
                        {q.dynamic_questions?.question_categories?.name}
                      </span>
                      {q.quality_rating && (
                        <Badge variant={q.quality_rating >= 4 ? 'default' : 'secondary'}>
                          {q.quality_rating}/5 ⭐
                        </Badge>
                      )}
                      {q.promoted_to_template && (
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Promoted
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Original: {q.dynamic_questions?.question_text}
                    </p>
                    <p className="text-sm">
                      <strong>User Answer:</strong> {q.user_answer}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-purple-50 p-4">
                  <p className="font-medium">AI-Generated Question:</p>
                  <p className="mt-2">{q.generated_question_text}</p>
                </div>

                {q.answer_text && (
                  <div className="rounded-lg bg-blue-50 p-4">
                    <p className="font-medium">User's Answer:</p>
                    <p className="mt-2">{q.answer_text}</p>
                  </div>
                )}

                {!q.admin_reviewed && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleReview(q.id, true)}
                      className="flex-1"
                    >
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleReview(q.id, false)}
                      className="flex-1"
                    >
                      Reject
                    </Button>
                    {q.quality_rating && q.quality_rating >= 4 && (
                      <Button
                        onClick={() => openPromoteDialog(q)}
                        className="flex-1"
                      >
                        <ArrowUpCircle className="h-4 w-4 mr-2" />
                        Promote to Template
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Promote Dialog */}
      <Dialog
        open={promoteDialog.open}
        onOpenChange={(open) =>
          setPromoteDialog({ ...promoteDialog, open })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Promote to Template Question</DialogTitle>
            <DialogDescription>
              Edit the question text before promoting it to a template
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={promoteDialog.editedText}
              onChange={(e) =>
                setPromoteDialog({
                  ...promoteDialog,
                  editedText: e.target.value,
                })
              }
              rows={4}
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() =>
                  setPromoteDialog({ open: false, question: null, editedText: '' })
                }
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handlePromote} className="flex-1">
                Promote
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
