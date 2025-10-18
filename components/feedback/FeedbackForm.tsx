'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Camera, Send } from 'lucide-react';
import { toast } from 'sonner';

const feedbackSchema = z.object({
  type: z.enum(['bug', 'feature', 'general']),
  title: z.string().min(2, 'Title must be at least 2 characters'),
  name: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  description: z.string().min(10, 'Description must be at least 10 characters'),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

interface FeedbackFormProps {
  onSuccess: () => void;
  onStartScreenshot: () => void;
  onStartAreaScreenshot: () => void;
  screenshots: string[];
  onRemoveScreenshot: (index: number) => void;
}

export function FeedbackForm({
  onSuccess,
  onStartScreenshot,
  onStartAreaScreenshot,
  screenshots,
  onRemoveScreenshot,
}: FeedbackFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const form = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      type: 'general',
      title: '',
      name: '',
      email: '',
      description: '',
    },
  });

  const handleScreenshot = () => {
    setIsCapturing(true);
    // Parent component will handle screenshot capture and annotation
    onStartScreenshot();
  };

  const handleAreaScreenshot = () => {
    setIsCapturing(true);
    // Parent component will handle area screenshot capture and annotation
    onStartAreaScreenshot();
  };

  const onSubmit = async (data: FeedbackFormData) => {
    setIsSubmitting(true);
    try {
      // Collect browser info
      const browserInfo = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
      };

      // Collect console logs (last 50 errors)
      const consoleLogs = (window as any).__feedbackConsoleLogs || [];

      const payload = {
        ...data,
        screenshots: screenshots, // Array of screenshot URLs
        page_url: window.location.href,
        browser_info: browserInfo,
        console_logs: consoleLogs.slice(-50), // Last 50 logs
      };

      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to submit feedback');

      toast.success('Feedback submitted successfully!');
      form.reset();
      onSuccess(); // This will also clear screenshots in parent
    } catch (error) {
      console.error('Feedback submission error:', error);
      toast.error('Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Type Selection */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Feedback Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="bug">🐛 Bug Report</SelectItem>
                  <SelectItem value="feature">💡 Feature Request</SelectItem>
                  <SelectItem value="general">💬 General Feedback</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Brief summary of your feedback" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Name and Email (optional) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Your name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email (optional)</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="your@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Provide detailed information..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Screenshots Preview */}
        {screenshots.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Screenshots ({screenshots.length})
            </label>
            <div className="grid grid-cols-2 gap-2">
              {screenshots.map((screenshot, index) => (
                <div key={index} className="relative rounded-lg overflow-hidden border">
                  <img
                    src={screenshot}
                    alt={`Screenshot ${index + 1}`}
                    className="w-full h-auto"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => onRemoveScreenshot(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 justify-between">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleScreenshot}
              disabled={isSubmitting || isCapturing}
            >
              <Camera className="mr-2 h-4 w-4" />
              Full Page
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleAreaScreenshot}
              disabled={isSubmitting || isCapturing}
            >
              <Camera className="mr-2 h-4 w-4" />
              Select Area
            </Button>
          </div>

          <Button type="submit" disabled={isSubmitting}>
            <Send className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
