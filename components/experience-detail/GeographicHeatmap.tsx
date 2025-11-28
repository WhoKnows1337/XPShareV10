'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from 'react-leaflet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, TrendingUp } from 'lucide-react';

// Note: Leaflet CSS is loaded dynamically in useEffect to avoid webpack bundling issues with RSC

/**
 * GeographicHeatmap - Phase 4, Task 4.1
 *
 * Interactive map showing geographic clusters of similar experiences.
 * Uses OpenStreetMap via Leaflet (no API key required).
 *
 * @see docs/maindocs/xpresultsv2/09-plan.md - Phase 4, Task 4.1
 */

interface GeoCluster {
  id: string;
  center_lat: number;
  center_lng: number;
  radius_km: number;
  experience_count: number;
  is_current?: boolean;
  increase_vs_baseline?: number;
  experiences: Array<{
    id: string;
    title?: string;
    lat: number;
    lng: number;
  }>;
}

interface GeographicHeatmapProps {
  clusters: GeoCluster[];
  currentExperience?: {
    lat: number;
    lng: number;
  };
}

export function GeographicHeatmap({ clusters, currentExperience }: GeographicHeatmapProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Dynamically import Leaflet CSS on client side only to avoid RSC webpack bundling issues
    import('leaflet/dist/leaflet.css');
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <CardTitle>Geographic Distribution</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] bg-muted/50 rounded-lg flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (clusters.length === 0 || !currentExperience) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <CardTitle>Geographic Distribution</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] bg-muted/50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm text-muted-foreground">No geographic data available</p>
              <p className="text-xs text-muted-foreground mt-1">
                Experiences need location data to show on map
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const center: [number, number] = [currentExperience.lat, currentExperience.lng];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <CardTitle>Geographic Distribution</CardTitle>
          </div>
          <Badge variant="secondary">
            {clusters.reduce((sum, c) => sum + c.experience_count, 0)} experiences
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Clusters of similar experiences by location
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] rounded-lg overflow-hidden">
          <MapContainer
            center={center}
            zoom={8}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {clusters.map((cluster) => {
              const isCurrent = cluster.is_current
              const radius = isCurrent ? 12 : Math.min(8 + cluster.experience_count * 2, 25)
              const color = isCurrent
                ? '#f59e0b' // Current: orange
                : cluster.increase_vs_baseline && cluster.increase_vs_baseline > 150
                ? '#ef4444' // Hot cluster: red
                : cluster.experience_count > 5
                ? '#3b82f6' // Medium cluster: blue
                : '#64748b' // Small cluster: gray

              return (
                <CircleMarker
                  key={cluster.id}
                  center={[cluster.center_lat, cluster.center_lng]}
                  radius={radius}
                  pathOptions={{
                    color: color,
                    fillColor: color,
                    fillOpacity: 0.6,
                    weight: isCurrent ? 3 : 2,
                  }}
                >
                  <Tooltip>
                    {isCurrent ? (
                      <div className="text-xs">
                        <strong>Your Experience</strong>
                      </div>
                    ) : (
                      <div className="text-xs">
                        <strong>{cluster.experience_count} experiences</strong>
                        {cluster.increase_vs_baseline && (
                          <div className="flex items-center gap-1 mt-1">
                            <TrendingUp className="h-3 w-3" />
                            <span>{cluster.increase_vs_baseline}% vs baseline</span>
                          </div>
                        )}
                      </div>
                    )}
                  </Tooltip>

                  <Popup>
                    <div className="p-2 min-w-[200px]">
                      {isCurrent ? (
                        <>
                          <h3 className="font-semibold mb-2">Your Experience</h3>
                          <p className="text-xs text-muted-foreground">
                            This is the location of your experience
                          </p>
                        </>
                      ) : (
                        <>
                          <h3 className="font-semibold mb-2">Cluster Details</h3>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Experiences:</span>
                              <strong>{cluster.experience_count}</strong>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Radius:</span>
                              <span>{cluster.radius_km} km</span>
                            </div>
                            {cluster.increase_vs_baseline && (
                              <div className="flex justify-between items-center mt-2 pt-2 border-t">
                                <span className="text-muted-foreground">Activity:</span>
                                <Badge variant="secondary" className="text-xs">
                                  <TrendingUp className="h-3 w-3 mr-1" />
                                  {cluster.increase_vs_baseline}%
                                </Badge>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </Popup>
                </CircleMarker>
              )
            })}
          </MapContainer>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span className="text-muted-foreground">Your Experience</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-muted-foreground">Hot Cluster (&gt;150%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-muted-foreground">Medium Cluster (5+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-slate-500" />
            <span className="text-muted-foreground">Small Cluster</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
