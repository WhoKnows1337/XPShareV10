'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { History, RefreshCw, FileText, FolderOpen } from 'lucide-react'
import { format } from 'date-fns'

interface Change {
  id: string
  entity_type: 'question' | 'category'
  entity_id: string | null
  change_type: string
  description: string
  old_value: any
  new_value: any
  changed_at: string
  changed_by: string | null
}

interface HistoryClientProps {
  changes: Change[]
}

export function HistoryClient({ changes: initialChanges }: HistoryClientProps) {
  const [changes] = useState(initialChanges)
  const [filterType, setFilterType] = useState<string>('all')
  const [filterEntity, setFilterEntity] = useState<string>('all')

  const filteredChanges = changes.filter((change) => {
    if (filterType !== 'all' && change.change_type !== filterType) return false
    if (filterEntity !== 'all' && change.entity_type !== filterEntity) return false
    return true
  })

  const getChangeIcon = (entityType: string) => {
    return entityType === 'category' ? (
      <FolderOpen className="h-4 w-4" />
    ) : (
      <FileText className="h-4 w-4" />
    )
  }

  const getChangeBadgeVariant = (changeType: string) => {
    switch (changeType) {
      case 'created':
        return 'default'
      case 'updated':
        return 'secondary'
      case 'deleted':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Change History</h2>
          <p className="text-muted-foreground">
            View all changes to questions and categories
          </p>
        </div>
        <Button variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Entity Type</label>
              <Select value={filterEntity} onValueChange={setFilterEntity}>
                <SelectTrigger>
                  <SelectValue placeholder="All entities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entities</SelectItem>
                  <SelectItem value="question">Questions</SelectItem>
                  <SelectItem value="category">Categories</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Change Type</label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="All changes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Changes</SelectItem>
                  <SelectItem value="created">Created</SelectItem>
                  <SelectItem value="updated">Updated</SelectItem>
                  <SelectItem value="deleted">Deleted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change List */}
      <Card>
        <CardHeader>
          <CardTitle>Changes ({filteredChanges.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredChanges.length === 0 ? (
            <div className="py-12 text-center">
              <History className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No changes found</h3>
              <p className="text-sm text-muted-foreground">
                {filterType !== 'all' || filterEntity !== 'all'
                  ? 'Try adjusting your filters'
                  : 'No change history available'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredChanges.map((change) => (
                <div
                  key={change.id}
                  className="flex items-start gap-4 rounded-lg border p-4"
                >
                  <div className="mt-1">{getChangeIcon(change.entity_type)}</div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={getChangeBadgeVariant(change.change_type)}>
                        {change.change_type}
                      </Badge>
                      <Badge variant="outline">{change.entity_type}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(change.changed_at), 'PPp')}
                      </span>
                    </div>
                    <p className="text-sm font-medium">{change.description}</p>

                    {/* Show old/new values if available */}
                    {(change.old_value || change.new_value) && (
                      <div className="mt-2 rounded-md bg-muted p-3 space-y-2 text-xs">
                        {change.old_value && (
                          <div>
                            <span className="font-medium">Old:</span>{' '}
                            <code className="text-muted-foreground">
                              {typeof change.old_value === 'string'
                                ? change.old_value
                                : JSON.stringify(change.old_value, null, 2)}
                            </code>
                          </div>
                        )}
                        {change.new_value && (
                          <div>
                            <span className="font-medium">New:</span>{' '}
                            <code className="text-muted-foreground">
                              {typeof change.new_value === 'string'
                                ? change.new_value
                                : JSON.stringify(change.new_value, null, 2)}
                            </code>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
