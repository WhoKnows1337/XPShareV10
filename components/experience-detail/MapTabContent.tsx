import { Card, CardContent } from '@/components/ui/card';

interface MapTabContentProps {
  experience: {
    location_lat?: number | null;
    location_lng?: number | null;
    location_text?: string | null;
  };
  nearbyCount: number;
}

export default function MapTabContent({ experience, nearbyCount }: MapTabContentProps) {
  return (
    <div className="container mx-auto px-4">
      <Card className="glass-card">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Geographic View</h3>
          {experience.location_lat && experience.location_lng ? (
            <div className="space-y-4">
              <div className="aspect-square w-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  Map visualization: {experience.location_text}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-lg">
                  <p className="text-xs text-muted-foreground">Latitude</p>
                  <p className="text-sm font-mono">{experience.location_lat.toFixed(6)}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg">
                  <p className="text-xs text-muted-foreground">Longitude</p>
                  <p className="text-sm font-mono">{experience.location_lng.toFixed(6)}</p>
                </div>
              </div>
              {nearbyCount > 0 && (
                <p className="text-sm text-muted-foreground text-center">
                  {nearbyCount} nearby experiences in this area
                </p>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No location data available for this experience.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
