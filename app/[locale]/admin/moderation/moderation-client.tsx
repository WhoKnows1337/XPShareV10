'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Flag,
  Search,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  BarChart3,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { ModerationActions } from '@/components/admin/moderation-actions'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { useTranslations } from 'next-intl'

interface Report {
  id: string
  experience_id: string
  reported_by: string
  reason: string
  details: string | null
  status: string
  reviewed_by: string | null
  reviewed_at: string | null
  admin_notes: string | null
  created_at: string
  experiences?: {
    id: string
    title: string
    category: string
    user_id: string
  }
  user_profiles?: {
    username: string
    display_name: string
  }
}

interface ModerationClientProps {
  initialReports: Report[]
}

const reasonLabels: Record<string, string> = {
  spam: '🚫 Spam',
  inappropriate: '⚠️ Inappropriate',
  harassment: '😡 Harassment',
  false: '❌ False Story',
  privacy: '🔒 Privacy',
  other: '❓ Other',
}

const reasonColors: Record<string, string> = {
  spam: 'destructive',
  inappropriate: 'destructive',
  harassment: 'destructive',
  false: 'secondary',
  privacy: 'secondary',
  other: 'outline',
}

export function ModerationClient({ initialReports }: ModerationClientProps) {
  const t = useTranslations('admin.moderation')
  const [reports, setReports] = useState(initialReports)
  const [filteredReports, setFilteredReports] = useState(initialReports)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const router = useRouter()
  const { toast } = useToast()

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [reasonFilter, setReasonFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('pending')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  // Tab
  const [activeTab, setActiveTab] = useState('pending')

  // Load reports based on filters
  useEffect(() => {
    loadReports()
  }, [statusFilter, activeTab])

  const loadReports = async () => {
    try {
      const status = activeTab === 'pending' ? 'pending' : 'all'
      const res = await fetch(`/api/reports?status=${status}`)

      if (res.ok) {
        const data = await res.json()
        setReports(data.reports || [])
      }
    } catch (error) {
      console.error('Failed to load reports:', error)
    }
  }

  // Apply filters
  useEffect(() => {
    let filtered = reports

    // Tab filter
    if (activeTab === 'pending') {
      filtered = filtered.filter((r) => r.status === 'pending')
    } else {
      filtered = filtered.filter((r) => r.status !== 'pending')
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((r) =>
        r.experiences?.title?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Reason filter
    if (reasonFilter !== 'all') {
      filtered = filtered.filter((r) => r.reason === reasonFilter)
    }

    // Date filter
    if (dateFilter !== 'all') {
      const daysAgo = parseInt(dateFilter)
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysAgo)
      filtered = filtered.filter(
        (r) => new Date(r.created_at) >= cutoffDate
      )
    }

    setFilteredReports(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }, [reports, searchTerm, reasonFilter, dateFilter, activeTab])

  // Pagination
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage)
  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Selection
  const handleSelectAll = () => {
    if (selectedIds.size === paginatedReports.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(paginatedReports.map((r) => r.id)))
    }
  }

  const handleSelectReport = (reportId: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(reportId)) {
      newSelected.delete(reportId)
    } else {
      newSelected.add(reportId)
    }
    setSelectedIds(newSelected)
  }

  // Bulk actions
  const handleBulkAction = async (action: 'approve' | 'dismiss' | 'delete') => {
    if (selectedIds.size === 0) return

    if (!confirm(t('bulkActions.confirmMessage', { count: selectedIds.size, action }))) {
      return
    }

    try {
      for (const reportId of selectedIds) {
        const report = reports.find((r) => r.id === reportId)
        if (!report) continue

        await fetch('/api/admin/moderation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reportId: report.id,
            experienceId: report.experience_id,
            action,
            notes: `Bulk action: ${action}`,
          }),
        })
      }

      toast({
        title: t('toast.success'),
        description: t('toast.reportsResolved', { count: selectedIds.size }),
      })

      setSelectedIds(new Set())
      await loadReports()
      router.refresh()
    } catch (error) {
      console.error('Bulk action error:', error)
      toast({
        title: t('toast.error'),
        description: t('toast.actionFailed'),
        variant: 'destructive',
      })
    }
  }

  // Calculate stats
  const stats = {
    pending: reports.filter((r) => r.status === 'pending').length,
    resolved: reports.filter((r) => r.status === 'resolved').length,
    dismissed: reports.filter((r) => r.status === 'dismissed').length,
    total: reports.length,
  }

  // Calculate reason distribution for analytics
  const reasonStats = reports.reduce((acc, report) => {
    acc[report.reason] = (acc[report.reason] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">{t('title')}</h2>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
      </div>

      {/* Stats KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.pending')}</CardTitle>
            <Flag className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.resolved')}</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.resolved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.dismissed')}</CardTitle>
            <XCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.dismissed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.total')}</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">
            {t('tabs.pending')} ({stats.pending})
          </TabsTrigger>
          <TabsTrigger value="history">
            {t('tabs.history')} ({stats.resolved + stats.dismissed})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>{t('filters.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('filters.searchExperience')}</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t('filters.searchPlaceholder')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('filters.reason')}</label>
                  <Select value={reasonFilter} onValueChange={setReasonFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('filters.allReasons')}</SelectItem>
                      {Object.entries(reasonLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {t(`reasons.${key}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('filters.dateRange')}</label>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('filters.allTime')}</SelectItem>
                      <SelectItem value="7">{t('filters.last7Days')}</SelectItem>
                      <SelectItem value="30">{t('filters.last30Days')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Results</label>
                  <div className="text-sm font-semibold flex items-center h-10 px-3 rounded-md border">
                    {filteredReports.length} report{filteredReports.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bulk Actions Bar */}
          {selectedIds.size > 0 && (
            <Card className="border-primary">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {t('bulkActions.selected')}: {selectedIds.size}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleBulkAction('approve')}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      {t('bulkActions.keepResolve')}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkAction('dismiss')}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      {t('bulkActions.dismiss')}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleBulkAction('delete')}
                    >
                      {t('bulkActions.deleteExperiences')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reports List */}
          {paginatedReports.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Flag className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {filteredReports.length === 0 && searchTerm === '' && reasonFilter === 'all'
                    ? t('empty.noPending')
                    : t('empty.noMatching')}
                </h3>
                <p className="text-muted-foreground">
                  {filteredReports.length === 0 && (searchTerm !== '' || reasonFilter !== 'all')
                    ? t('empty.adjustFilters')
                    : t('empty.allCaughtUp')}
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {paginatedReports.length > 0 && (
                <div className="flex items-center gap-2 px-2">
                  <Checkbox
                    checked={selectedIds.size === paginatedReports.length}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-sm text-muted-foreground">
                    Select all on page
                  </span>
                </div>
              )}

              <div className="space-y-4">
                {paginatedReports.map((report) => (
                  <Card key={report.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <Checkbox
                            checked={selectedIds.has(report.id)}
                            onCheckedChange={() => handleSelectReport(report.id)}
                          />
                          <div className="space-y-1 flex-1">
                            <CardTitle className="text-lg flex items-center gap-2">
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
                                {t('list.reportedBy')} @{report.user_profiles?.username || 'unknown'}
                              </span>
                              <span>•</span>
                              <span>
                                {t('list.reportedAt')} {formatDistanceToNow(new Date(report.created_at), {
                                  addSuffix: true,
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Badge variant={reasonColors[report.reason] as any}>
                          {t(`reasons.${report.reason}`)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {report.details && (
                        <div className="rounded-lg bg-muted p-3">
                          <p className="text-xs font-semibold text-muted-foreground mb-1">
                            {t('list.description')}:
                          </p>
                          <p className="text-sm">{report.details}</p>
                        </div>
                      )}

                      <ModerationActions
                        reportId={report.id}
                        experienceId={report.experiences?.id || ''}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    {t('pagination.previous')}
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    {t('pagination.showing', { start: (currentPage - 1) * itemsPerPage + 1, end: Math.min(currentPage * itemsPerPage, filteredReports.length), total: filteredReports.length })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    {t('pagination.next')}
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {/* History List */}
          {filteredReports.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">{t('history.noHistory')}</h3>
                <p className="text-muted-foreground">
                  Resolved and dismissed reports will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredReports.slice(0, 50).map((report) => (
                <Card key={report.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
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
                            {t('list.reportedBy')} @{report.user_profiles?.username || 'unknown'}
                          </span>
                          <span>•</span>
                          <span>
                            {report.reviewed_at
                              ? `${t('history.status')}: ${report.status === 'resolved' ? t('history.resolvedOn') : t('history.dismissedOn')} ${formatDistanceToNow(new Date(report.reviewed_at), {
                                  addSuffix: true,
                                })}`
                              : 'Not reviewed'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={reasonColors[report.reason] as any}>
                          {t(`reasons.${report.reason}`)}
                        </Badge>
                        <Badge
                          variant={report.status === 'resolved' ? 'default' : 'secondary'}
                        >
                          {report.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  {(report.details || report.admin_notes) && (
                    <CardContent className="space-y-3">
                      {report.details && (
                        <div className="rounded-lg bg-muted p-3">
                          <p className="text-xs font-semibold text-muted-foreground mb-1">
                            User Report:
                          </p>
                          <p className="text-sm">{report.details}</p>
                        </div>
                      )}
                      {report.admin_notes && (
                        <div className="rounded-lg bg-primary/10 p-3">
                          <p className="text-xs font-semibold text-muted-foreground mb-1">
                            Admin Notes:
                          </p>
                          <p className="text-sm">{report.admin_notes}</p>
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
