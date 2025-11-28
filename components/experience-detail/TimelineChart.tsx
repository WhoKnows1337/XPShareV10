'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp, Zap } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot,
} from 'recharts';
import { format } from 'date-fns';

/**
 * TimelineChart - Phase 4, Task 4.2
 *
 * Timeline visualization showing experience count over time with spike detection.
 * Highlights the current experience date and temporal patterns.
 *
 * @see docs/maindocs/xpresultsv2/09-plan.md - Phase 4, Task 4.2
 */

interface TimelinePoint {
  date: string;
  count: number;
  cumulative_count: number;
}

interface TemporalSpike {
  spike_date: string;
  experience_count: number;
  expected_count: number;
  significance: number;
}

interface TimelineChartProps {
  data: TimelinePoint[];
  spikes: TemporalSpike[];
  currentExperienceDate: string;
}

export function TimelineChart({ data, spikes, currentExperienceDate }: TimelineChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <CardTitle>Temporal Pattern</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] bg-muted/50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm text-muted-foreground">No temporal data available</p>
              <p className="text-xs text-muted-foreground mt-1">
                Not enough experiences to show timeline
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-sm mb-1">
            {format(new Date(data.date), 'MMM dd, yyyy')}
          </p>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">New:</span>
              <strong>{data.count}</strong>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Cumulative:</span>
              <strong>{data.cumulative_count}</strong>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  // Find if current experience is on a spike
  const currentSpike = spikes.find(s => s.spike_date === currentExperienceDate)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <CardTitle>Temporal Pattern</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {spikes.length > 0 && (
              <Badge variant="secondary" className="gap-1">
                <Zap className="h-3 w-3" />
                {spikes.length} spike{spikes.length > 1 ? 's' : ''}
              </Badge>
            )}
            <Badge variant="outline">
              {data[data.length - 1]?.cumulative_count || 0} total
            </Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Experience count over time {currentSpike && '· Your experience is on a spike!'}
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                className="text-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <Tooltip content={<CustomTooltip />} />

              {/* Highlight current experience date */}
              <ReferenceLine
                x={currentExperienceDate}
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                strokeDasharray="5 5"
                label={{
                  value: 'Your Experience',
                  position: 'top',
                  fill: 'hsl(var(--primary))',
                  fontSize: 12,
                  fontWeight: 'bold',
                }}
              />

              {/* Mark spikes */}
              {spikes.map((spike, i) => (
                <ReferenceDot
                  key={i}
                  x={spike.spike_date}
                  y={spike.experience_count}
                  r={6}
                  fill="#ef4444"
                  stroke="#fff"
                  strokeWidth={2}
                />
              ))}

              <Area
                type="monotone"
                dataKey="count"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorCount)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Spikes List */}
        {spikes.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Zap className="h-4 w-4 text-red-500" />
              <span>Detected Spikes</span>
            </div>
            <div className="space-y-2">
              {spikes.slice(0, 3).map((spike, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/50 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="font-medium">
                      {format(new Date(spike.spike_date), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="text-xs">
                      {spike.experience_count} experiences
                    </Badge>
                    <div className="flex items-center gap-1 text-red-500">
                      <TrendingUp className="h-3 w-3" />
                      <span className="font-semibold">{spike.significance}x</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-3 text-xs pt-4 border-t">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-muted-foreground">Daily Count</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-muted-foreground">Spike (3x+ average)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-primary" style={{ width: 16 }} />
            <span className="text-muted-foreground">Your Experience</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
