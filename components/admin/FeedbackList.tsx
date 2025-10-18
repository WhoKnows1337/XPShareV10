'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { FeedbackDetailDialog } from './FeedbackDetailDialog';
import { Bug, Lightbulb, MessageSquare, Search, Filter } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useTranslations } from 'next-intl';

type FeedbackType = 'bug' | 'feature' | 'general';
type FeedbackStatus = 'new' | 'in_progress' | 'resolved' | 'closed';
type FeedbackPriority = 'low' | 'medium' | 'high' | 'critical';

interface Feedback {
  id: string;
  type: FeedbackType;
  status: FeedbackStatus;
  priority: FeedbackPriority;
  title: string;
  description: string;
  page_url: string;
  screenshot_url?: string;
  screenshots?: string[];
  browser_info?: any;
  console_logs?: any;
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    username: string;
    avatar_url?: string;
  };
}

export function FeedbackList() {
  const t = useTranslations('admin.feedback');
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [filteredFeedback, setFilteredFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);

  // Filters
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchFeedback();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [feedback, typeFilter, statusFilter, priorityFilter, searchQuery]);

  const fetchFeedback = async () => {
    try {
      const response = await fetch('/api/feedback');
      if (!response.ok) throw new Error('Failed to fetch feedback');
      const data = await response.json();
      setFeedback(data.feedback || []);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...feedback];

    if (typeFilter !== 'all') {
      filtered = filtered.filter((f) => f.type === typeFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((f) => f.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter((f) => f.priority === priorityFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (f) =>
          f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredFeedback(filtered);
  };

  const getTypeIcon = (type: FeedbackType) => {
    switch (type) {
      case 'bug':
        return <Bug className="h-4 w-4" />;
      case 'feature':
        return <Lightbulb className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: FeedbackStatus) => {
    switch (status) {
      case 'new':
        return 'bg-blue-500';
      case 'in_progress':
        return 'bg-yellow-500';
      case 'resolved':
        return 'bg-green-500';
      case 'closed':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: FeedbackPriority) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-600 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  if (loading) {
    return <div>{t('loading')}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {t('filters.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('filters.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t('filters.type')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('filters.allTypes')}</SelectItem>
                <SelectItem value="bug">{t('filters.bug')}</SelectItem>
                <SelectItem value="feature">{t('filters.feature')}</SelectItem>
                <SelectItem value="general">{t('filters.general')}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t('filters.status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('filters.allStatuses')}</SelectItem>
                <SelectItem value="new">{t('filters.new')}</SelectItem>
                <SelectItem value="in_progress">{t('filters.inProgress')}</SelectItem>
                <SelectItem value="resolved">{t('filters.resolved')}</SelectItem>
                <SelectItem value="closed">{t('filters.closed')}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t('filters.priority')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('filters.allPriorities')}</SelectItem>
                <SelectItem value="critical">{t('filters.critical')}</SelectItem>
                <SelectItem value="high">{t('filters.high')}</SelectItem>
                <SelectItem value="medium">{t('filters.medium')}</SelectItem>
                <SelectItem value="low">{t('filters.low')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Feedback Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t('stats.total')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{feedback.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t('stats.new')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {feedback.filter((f) => f.status === 'new').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t('stats.inProgress')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {feedback.filter((f) => f.status === 'in_progress').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t('stats.resolved')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {feedback.filter((f) => f.status === 'resolved').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feedback List */}
      <div className="space-y-4">
        {filteredFeedback.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              {t('list.noFeedback')}
            </CardContent>
          </Card>
        ) : (
          filteredFeedback.map((item) => (
            <Card
              key={item.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedFeedback(item)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    {getTypeIcon(item.type)}
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getPriorityColor(item.priority)}>
                      {item.priority}
                    </Badge>
                    <Badge className={getStatusColor(item.status)}>
                      {item.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                <CardDescription className="flex items-center gap-4 text-xs">
                  <span>
                    {t('list.by')} {item.user.username} •{' '}
                    {formatDistanceToNow(new Date(item.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                  {((item.screenshots && item.screenshots.length > 0) || item.screenshot_url) && (
                    <Badge variant="outline">
                      📸 {item.screenshots?.length || 1} {(item.screenshots?.length || 1) > 1 ? t('list.screenshotsPlural') : t('list.screenshots')}
                    </Badge>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Detail Dialog */}
      {selectedFeedback && (
        <FeedbackDetailDialog
          feedback={selectedFeedback}
          open={!!selectedFeedback}
          onOpenChange={(open) => !open && setSelectedFeedback(null)}
          onUpdate={fetchFeedback}
        />
      )}
    </div>
  );
}
