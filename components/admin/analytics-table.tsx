'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

interface AnalyticsTableProps {
  data: any[]
  isLoading: boolean
}

export function AnalyticsTable({ data, isLoading }: AnalyticsTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Loading table data...</p>
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Question Performance</CardTitle>
        </CardHeader>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No analytics data available</p>
        </CardContent>
      </Card>
    )
  }

  // Sort by answer rate descending
  const sortedData = [...data].sort(
    (a, b) => (b.answer_rate || 0) - (a.answer_rate || 0)
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Question Performance Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Question</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Shown</TableHead>
                <TableHead className="text-right">Answered</TableHead>
                <TableHead className="text-right">Skipped</TableHead>
                <TableHead className="text-right">Answer Rate</TableHead>
                <TableHead className="text-right">Avg Time (s)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((row) => (
                <TableRow key={row.question_id}>
                  <TableCell className="max-w-xs truncate">
                    {row.question_text}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{row.category_name}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {row.total_shown?.toLocaleString() || 0}
                  </TableCell>
                  <TableCell className="text-right">
                    {row.total_answered?.toLocaleString() || 0}
                  </TableCell>
                  <TableCell className="text-right">
                    {row.total_skipped?.toLocaleString() || 0}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={
                        (row.answer_rate || 0) >= 70
                          ? 'default'
                          : (row.answer_rate || 0) >= 40
                          ? 'secondary'
                          : 'destructive'
                      }
                    >
                      {row.answer_rate?.toFixed(1) || '0.0'}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {row.avg_response_time?.toFixed(1) || '0.0'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
