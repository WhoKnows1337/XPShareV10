import { Card, CardContent } from '@/components/ui/card';

interface YouTabContentProps {
  experience: {
    view_count?: number;
    upvote_count?: number;
    comment_count?: number;
  };
  connectionsCount: number;
  userData: {
    topBadges?: Array<{ icon: string; name: string }>;
  };
}

export default function YouTabContent({
  experience,
  connectionsCount,
  userData,
}: YouTabContentProps) {
  return (
    <div className="container mx-auto px-4">
      <Card className="glass-card border-yellow-500/20">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Your Impact</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <p className="text-3xl font-bold">{experience.view_count || 0}</p>
                <p className="text-sm text-muted-foreground">Views</p>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <p className="text-3xl font-bold">{experience.upvote_count || 0}</p>
                <p className="text-sm text-muted-foreground">Likes</p>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <p className="text-3xl font-bold">{experience.comment_count || 0}</p>
                <p className="text-sm text-muted-foreground">Comments</p>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <p className="text-3xl font-bold">{connectionsCount}</p>
                <p className="text-sm text-muted-foreground">Connections</p>
              </div>
            </div>
            {userData.topBadges && userData.topBadges.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Your Top Badges</p>
                <div className="flex gap-3">
                  {userData.topBadges.map((badge: any, index: number) => (
                    <div key={index} className="text-center">
                      <div className="text-4xl mb-1">{badge.icon}</div>
                      <p className="text-xs text-muted-foreground">{badge.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
