import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { QuestionList } from '@/components/admin/question-list'
import { AddQuestionDialog } from '@/components/admin/add-question-dialog'

export default async function QuestionsPage() {
  const supabase = await createClient()

  const { data: questions } = await supabase
    .from('questions')
    .select('*')
    .order('order_index', { ascending: true })

  const categories = [
    'ufo',
    'paranormal',
    'synchronicity',
    'nde',
    'psychic',
    'supernatural',
    'spiritual',
    'time_anomaly',
    'other',
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Questions Management</h2>
          <p className="text-muted-foreground">
            Manage dynamic questions for experience submissions
          </p>
        </div>
        <AddQuestionDialog />
      </div>

      <div className="space-y-6">
        {categories.map((category) => {
          const categoryQuestions = questions?.filter((q) => q.category === category) || []

          return (
            <Card key={category}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl capitalize flex items-center gap-2">
                    {category.replace('_', ' ')}
                    <Badge variant="secondary">{categoryQuestions.length} questions</Badge>
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {categoryQuestions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No questions for this category</p>
                ) : (
                  <QuestionList questions={categoryQuestions} />
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
