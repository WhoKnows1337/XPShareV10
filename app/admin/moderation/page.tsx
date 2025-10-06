import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ModerationActions } from '@/components/admin/moderation-actions'

export default async function ModerationPage() {
  const supabase = await createClient()

  const { data: reports } = await supabase
    .from('reports')
    .select(`
      *,
      experiences (id, title, category, user_id),
      user_profiles!reports_reported_by_fkey (username, display_name)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(50)

  const reasonLabels: Record<string, string> = {
    spam: 'Spam or Misleading',
    inappropriate: 'Inappropriate Content',
    harassment: 'Harassment',
    false: 'False Story',
    privacy: 'Privacy Violation',
    other: 'Other',
  }

  const reasonColors: Record<string, string> = {
    spam: 'destructive',
    inappropriate: 'destructive',
    harassment: 'destructive',
    false: 'secondary',
    privacy: 'secondary',
    other: 'outline',
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Content Moderation</h2>
        <p className="text-muted-foreground">Review and moderate reported content</p>
      </div>

      {!reports || reports.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">No pending reports</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reports.map((report: any) => (
            <Card key={report.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">
                      <Link
                        href={`/experiences/${report.experiences?.id}`}
                        className="hover:underline"
                        target="_blank"
                      >
                        {report.experiences?.title || 'Deleted Experience'}
                      </Link>
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>
                        Reported by @{report.user_profiles?.username || 'unknown'}
                      </span>
                      <span>•</span>
                      <span>
                        {formatDistanceToNow(new Date(report.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                  <Badge variant={reasonColors[report.reason] as any}>
                    {reasonLabels[report.reason]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {report.details && (
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-sm">{report.details}</p>
                  </div>
                )}

                <ModerationActions
                  reportId={report.id}
                  experienceId={report.experiences?.id}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
