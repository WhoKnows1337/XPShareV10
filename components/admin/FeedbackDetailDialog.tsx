'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ExternalLink, MessageSquare, Send } from 'lucide-react';

interface FeedbackDetailDialogProps {
  feedback: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export function FeedbackDetailDialog({
  feedback,
  open,
  onOpenChange,
  onUpdate,
}: FeedbackDetailDialogProps) {
  const [status, setStatus] = useState(feedback.status);
  const [priority, setPriority] = useState(feedback.priority);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      fetchComments();
    }
  }, [open, feedback.id]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/feedback/${feedback.id}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleUpdate = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/feedback/${feedback.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, priority }),
      });

      if (!response.ok) throw new Error('Failed to update');

      toast.success('Feedback updated successfully');
      onUpdate();
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/feedback/${feedback.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment }),
      });

      if (!response.ok) throw new Error('Failed to add comment');

      toast.success('Comment added');
      setComment('');
      await fetchComments();
    } catch (error) {
      console.error('Comment error:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {feedback.title}
            <Badge>{feedback.type}</Badge>
          </DialogTitle>
          <DialogDescription>
            Submitted by {feedback.user.username} •{' '}
            {formatDistanceToNow(new Date(feedback.created_at), {
              addSuffix: true,
            })}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            {/* Status & Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Priority
                </label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleUpdate}
              disabled={
                isSubmitting ||
                (status === feedback.status && priority === feedback.priority)
              }
              className="w-full"
            >
              Update Status & Priority
            </Button>

            <Separator />

            {/* Description */}
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {feedback.description}
              </p>
            </div>

            {/* Screenshots */}
            {((feedback.screenshots && feedback.screenshots.length > 0) || feedback.screenshot_url) && (
              <div>
                <h3 className="font-semibold mb-2">
                  Screenshots ({(feedback.screenshots?.length || (feedback.screenshot_url ? 1 : 0))})
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {/* New array format */}
                  {feedback.screenshots && feedback.screenshots.map((url: string, idx: number) => (
                    <div key={idx} className="rounded-lg overflow-hidden border">
                      <img
                        src={url}
                        alt={`Screenshot ${idx + 1}`}
                        className="w-full h-auto"
                      />
                    </div>
                  ))}

                  {/* Legacy single screenshot fallback */}
                  {!feedback.screenshots && feedback.screenshot_url && (
                    <div className="rounded-lg overflow-hidden border">
                      <img
                        src={feedback.screenshot_url}
                        alt="Feedback screenshot"
                        className="w-full h-auto"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Page URL */}
            {feedback.page_url && (
              <div>
                <h3 className="font-semibold mb-2">Page URL</h3>
                <a
                  href={feedback.page_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                >
                  {feedback.page_url}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}

            {/* Browser Info */}
            {feedback.browser_info && (
              <div>
                <h3 className="font-semibold mb-2">Browser Info</h3>
                <Card>
                  <CardContent className="text-xs pt-4 space-y-1">
                    <div>
                      <span className="font-medium">User Agent:</span>{' '}
                      {feedback.browser_info.userAgent}
                    </div>
                    <div>
                      <span className="font-medium">Screen:</span>{' '}
                      {feedback.browser_info.screenResolution}
                    </div>
                    <div>
                      <span className="font-medium">Viewport:</span>{' '}
                      {feedback.browser_info.viewport}
                    </div>
                    <div>
                      <span className="font-medium">Platform:</span>{' '}
                      {feedback.browser_info.platform}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Console Logs */}
            {feedback.console_logs && feedback.console_logs.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Console Logs</h3>
                <Card>
                  <CardContent className="text-xs pt-4 space-y-2">
                    {feedback.console_logs.map((log: any, idx: number) => (
                      <div
                        key={idx}
                        className={`p-2 rounded ${
                          log.type === 'error'
                            ? 'bg-red-50 text-red-900'
                            : 'bg-yellow-50 text-yellow-900'
                        }`}
                      >
                        <div className="font-mono text-xs">
                          [{log.type.toUpperCase()}] {log.message}
                        </div>
                        <div className="text-xs opacity-70">{log.timestamp}</div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            )}

            <Separator />

            {/* Comments */}
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Internal Comments ({comments.length})
              </h3>

              <div className="space-y-4 mb-4">
                {comments.map((c) => (
                  <Card key={c.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {c.user?.username || 'Admin'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(c.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm whitespace-pre-wrap">{c.comment}</p>
                    </CardContent>
                  </Card>
                ))}

                {comments.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No comments yet
                  </p>
                )}
              </div>

              {/* Add Comment */}
              <div className="space-y-2">
                <Textarea
                  placeholder="Add an internal comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                />
                <Button
                  onClick={handleAddComment}
                  disabled={!comment.trim() || isSubmitting}
                  className="w-full"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Add Comment
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
