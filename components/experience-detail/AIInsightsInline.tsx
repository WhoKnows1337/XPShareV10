'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Clock, Compass, Zap } from 'lucide-react';

interface AIInsightsInlineProps {
  keyDetails?: Array<{
    label: string;
    value: string;
    icon?: string;
  }>;
  patternStrength?: number;
  categoryMatches?: number;
  locationMatches?: number;
  temporalMatches?: number;
}

export function AIInsightsInline({
  keyDetails = [],
  patternStrength = 0,
  categoryMatches = 0,
  locationMatches = 0,
  temporalMatches = 0,
}: AIInsightsInlineProps) {
  // Default key details if none provided
  const defaultDetails = [
    { label: 'Time', value: '9-11 PM', icon: '🕐' },
    { label: 'Direction', value: 'NE', icon: '🧭' },
    { label: 'Duration', value: '45s', icon: '⏱️' },
  ];

  const displayDetails = keyDetails.length > 0 ? keyDetails : defaultDetails;

  return (
    <Card className="glass-card border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-purple-500/5">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold">AI Insights</h3>
        </div>

        {/* Key Details */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">🎯 Key Details:</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {displayDetails.map((detail, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-3 bg-white/5 rounded-lg border border-white/10"
              >
                {detail.icon && <span className="text-lg">{detail.icon}</span>}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">{detail.label}</p>
                  <p className="text-sm font-medium truncate">{detail.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pattern Matches Summary */}
        {(categoryMatches > 0 || locationMatches > 0 || temporalMatches > 0) && (
          <div className="space-y-2 pt-3 border-t border-border/40">
            <p className="text-sm font-medium text-muted-foreground">Pattern Matches:</p>
            <div className="flex flex-wrap gap-2">
              {categoryMatches > 0 && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  {categoryMatches} Category
                </Badge>
              )}
              {locationMatches > 0 && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Compass className="w-3 h-3 text-blue-400" />
                  {locationMatches} Location
                </Badge>
              )}
              {temporalMatches > 0 && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-orange-400" />
                  {temporalMatches} Temporal
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Pattern Strength */}
        {patternStrength > 0 && (
          <div className="space-y-2 pt-3 border-t border-border/40">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Pattern Strength</span>
              <span className="font-semibold">{patternStrength}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000"
                style={{ width: `${patternStrength}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
