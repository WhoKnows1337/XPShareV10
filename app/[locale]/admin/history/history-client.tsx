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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { History, RefreshCw, FileText, FolderOpen, Download, ChevronDown, ChevronRight, Eye, Undo2 } from 'lucide-react'
import { format } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

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
  const [filterUser, setFilterUser] = useState<string>('all')
  const [dateRange, setDateRange] = useState<string>('30')
  const [expandedChanges, setExpandedChanges] = useState<Set<string>>(new Set())
  const [diffDialogChange, setDiffDialogChange] = useState<Change | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const filteredChanges = changes.filter((change) => {
    if (filterType !== 'all' && change.change_type !== filterType) return false
    if (filterEntity !== 'all' && change.entity_type !== filterEntity) return false
    if (filterUser !== 'all' && change.changed_by !== filterUser) return false

    // Date range filter
    if (dateRange !== 'all') {
      const daysAgo = parseInt(dateRange)
      const changeDate = new Date(change.changed_at)
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysAgo)
      if (changeDate < cutoffDate) return false
    }

    return true
  })

  // Get unique users for filter
  const uniqueUsers = Array.from(new Set(changes.map(c => c.changed_by).filter(Boolean)))

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

  const toggleExpanded = (changeId: string) => {
    const newExpanded = new Set(expandedChanges)
    if (newExpanded.has(changeId)) {
      newExpanded.delete(changeId)
    } else {
      newExpanded.add(changeId)
    }
    setExpandedChanges(newExpanded)
  }

  const handleUndo = async (change: Change) => {
    if (!confirm(`Are you sure you want to revert this change: "${change.description}"?`)) {
      return
    }

    try {
      const res = await fetch(`/api/admin/history/${change.id}/revert`, {
        method: 'POST',
      })

      if (!res.ok) throw new Error('Failed to revert change')

      toast({
        title: 'Success',
        description: 'Change reverted successfully',
      })

      router.refresh()
    } catch (error) {
      console.error('Revert error:', error)
      toast({
        title: 'Error',
        description: 'Failed to revert change',
        variant: 'destructive',
      })
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
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              const csv = [
                ['Date', 'Type', 'Entity', 'Description', 'User'].join(','),
                ...filteredChanges.map(c => [
                  new Date(c.changed_at).toISOString(),
                  c.change_type,
                  c.entity_type,
                  c.description?.replace(/,/g, ';') || '',
                  c.changed_by || 'System'
                ].join(','))
              ].join('\n')

              const blob = new Blob([csv], { type: 'text/csv' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `history-${new Date().toISOString()}.csv`
              a.click()
              URL.revokeObjectURL(url)
            }}
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
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
            <div>
              <label className="text-sm font-medium mb-2 block">User</label>
              <Select value={filterUser} onValueChange={setFilterUser}>
                <SelectTrigger>
                  <SelectValue placeholder="All users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {uniqueUsers.map(userId => (
                    <SelectItem key={userId} value={userId || ''}>
                      {userId || 'System'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Date Range</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="7">Last 7 Days</SelectItem>
                  <SelectItem value="30">Last 30 Days</SelectItem>
                  <SelectItem value="90">Last 90 Days</SelectItem>
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
              {filteredChanges.map((change) => {
                const isExpanded = expandedChanges.has(change.id)
                const hasDetails = change.old_value || change.new_value

                return (
                  <div
                    key={change.id}
                    className="rounded-lg border overflow-hidden"
                  >
                    {/* Change Header */}
                    <div className="flex items-start gap-4 p-4">
                      <div className="mt-1">{getChangeIcon(change.entity_type)}</div>
                      <div className="flex-1 space-y-2">
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

                        {/* Expand Details Button */}
                        {hasDetails && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpanded(change.id)}
                            className="h-auto py-1 px-2 text-xs"
                          >
                            {isExpanded ? (
                              <>
                                <ChevronDown className="h-3 w-3 mr-1" />
                                Hide Details
                              </>
                            ) : (
                              <>
                                <ChevronRight className="h-3 w-3 mr-1" />
                                Show Details
                              </>
                            )}
                          </Button>
                        )}

                        {/* Expanded Details */}
                        {isExpanded && hasDetails && (
                          <div className="mt-3 rounded-md bg-muted p-4 space-y-3 text-sm">
                            <h4 className="font-semibold text-xs uppercase text-muted-foreground">
                              Changes:
                            </h4>
                            {change.old_value && (
                              <div className="space-y-1">
                                <div className="font-medium text-xs text-muted-foreground">Old:</div>
                                <code className="block rounded bg-slate-800 text-red-400 p-2 text-xs whitespace-pre-wrap">
                                  {typeof change.old_value === 'string'
                                    ? change.old_value
                                    : JSON.stringify(change.old_value, null, 2)}
                                </code>
                              </div>
                            )}
                            {change.new_value && (
                              <div className="space-y-1">
                                <div className="font-medium text-xs text-muted-foreground">New:</div>
                                <code className="block rounded bg-slate-800 text-green-400 p-2 text-xs whitespace-pre-wrap">
                                  {typeof change.new_value === 'string'
                                    ? change.new_value
                                    : JSON.stringify(change.new_value, null, 2)}
                                </code>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2">
                          {hasDetails && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDiffDialogChange(change)}
                            >
                              <Eye className="mr-2 h-3 w-3" />
                              Diff View
                            </Button>
                          )}
                          {change.change_type !== 'deleted' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUndo(change)}
                            >
                              <Undo2 className="mr-2 h-3 w-3" />
                              Undo
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diff View Dialog */}
      <Dialog open={diffDialogChange !== null} onOpenChange={() => setDiffDialogChange(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Change Comparison</DialogTitle>
            <p className="text-sm text-muted-foreground">
              {diffDialogChange?.description}
            </p>
          </DialogHeader>
          {diffDialogChange && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              {/* Old Value */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <h3 className="text-sm font-semibold">Old Value</h3>
                </div>
                <div className="rounded-lg border bg-slate-50 p-4">
                  {diffDialogChange.old_value ? (
                    <pre className="text-xs whitespace-pre-wrap font-mono text-red-700">
                      {typeof diffDialogChange.old_value === 'string'
                        ? diffDialogChange.old_value
                        : JSON.stringify(diffDialogChange.old_value, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No previous value</p>
                  )}
                </div>
              </div>

              {/* New Value */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <h3 className="text-sm font-semibold">New Value</h3>
                </div>
                <div className="rounded-lg border bg-slate-50 p-4">
                  {diffDialogChange.new_value ? (
                    <pre className="text-xs whitespace-pre-wrap font-mono text-green-700">
                      {typeof diffDialogChange.new_value === 'string'
                        ? diffDialogChange.new_value
                        : JSON.stringify(diffDialogChange.new_value, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No new value</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
