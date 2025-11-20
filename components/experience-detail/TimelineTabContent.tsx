import { Card, CardContent } from '@/components/ui/card';

export default function TimelineTabContent() {
  return (
    <div className="container mx-auto px-4">
      <Card className="glass-card">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Timeline View</h3>
          <p className="text-muted-foreground text-center py-8">Timeline visualization coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
