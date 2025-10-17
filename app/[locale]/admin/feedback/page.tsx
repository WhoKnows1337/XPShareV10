import { Suspense } from 'react';
import { FeedbackList } from '@/components/admin/FeedbackList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = {
  title: 'Feedback Management - Admin',
  description: 'Manage user feedback, bug reports, and feature requests',
};

export default function AdminFeedbackPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Feedback Management</h1>
        <p className="text-muted-foreground mt-2">
          Review and respond to user feedback, bugs, and feature requests
        </p>
      </div>

      <Suspense fallback={<FeedbackListSkeleton />}>
        <FeedbackList />
      </Suspense>
    </div>
  );
}

function FeedbackListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <div className="h-6 bg-muted rounded animate-pulse w-3/4" />
            <div className="h-4 bg-muted rounded animate-pulse w-1/2 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="h-4 bg-muted rounded animate-pulse w-full" />
            <div className="h-4 bg-muted rounded animate-pulse w-5/6 mt-2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
