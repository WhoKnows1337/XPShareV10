'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Network, Info } from 'lucide-react';
import { useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

/**
 * CorrelationMatrix - Phase 4, Task 4.3
 *
 * Heatmap showing correlations between experience attributes.
 * Displays co-occurrence patterns and correlation strength.
 *
 * @see docs/maindocs/xpresultsv2/09-plan.md - Phase 4, Task 4.3
 */

interface AttributeCorrelation {
  attribute1: string;
  attribute2: string;
  attribute1_key: string;
  attribute2_key: string;
  co_occurrence_count: number;
  correlation_coefficient: number;
}

interface CorrelationMatrixProps {
  correlations: AttributeCorrelation[];
  maxAttributes?: number;
}

export function CorrelationMatrix({ correlations, maxAttributes = 15 }: CorrelationMatrixProps) {
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

  if (correlations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Network className="h-5 w-5 text-primary" />
            <CardTitle>Attribute Correlations</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] bg-muted/50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Network className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm text-muted-foreground">No correlation data available</p>
              <p className="text-xs text-muted-foreground mt-1">
                Need more experiences to detect patterns
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get top correlations (by count)
  const topCorrelations = correlations
    .sort((a, b) => b.co_occurrence_count - a.co_occurrence_count)
    .slice(0, maxAttributes)

  // Get color based on correlation strength
  const getColor = (coefficient: number) => {
    if (coefficient >= 0.7) return 'bg-blue-600 text-white'
    if (coefficient >= 0.5) return 'bg-blue-500 text-white'
    if (coefficient >= 0.3) return 'bg-blue-400 text-white'
    return 'bg-blue-300 text-foreground'
  }

  // Get correlation strength label
  const getStrength = (coefficient: number) => {
    if (coefficient >= 0.7) return 'Very Strong'
    if (coefficient >= 0.5) return 'Strong'
    if (coefficient >= 0.3) return 'Moderate'
    return 'Weak'
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Network className="h-5 w-5 text-primary" />
            <CardTitle>Attribute Correlations</CardTitle>
          </div>
          <Badge variant="secondary">
            {correlations.length} correlation{correlations.length !== 1 ? 's' : ''}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Attributes that frequently occur together
        </p>
      </CardHeader>
      <CardContent>
        {/* List View (better UX than matrix for many items) */}
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
          {topCorrelations.map((corr, i) => {
            const key = `${corr.attribute1}-${corr.attribute2}`
            const isHovered = hoveredCell === key

            return (
              <TooltipProvider key={i}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={`
                        relative p-4 rounded-lg border transition-all cursor-pointer
                        ${isHovered ? 'border-primary shadow-md scale-[1.02]' : 'border-muted hover:border-primary/50'}
                      `}
                      onMouseEnter={() => setHoveredCell(key)}
                      onMouseLeave={() => setHoveredCell(null)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        {/* Attributes */}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono text-xs">
                              {corr.attribute1}
                            </Badge>
                            <span className="text-xs text-muted-foreground">+</span>
                            <Badge variant="outline" className="font-mono text-xs">
                              {corr.attribute2}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            <strong className="text-foreground">{corr.co_occurrence_count}</strong> experiences
                            {' · '}
                            <span className="text-muted-foreground">
                              {(corr.correlation_coefficient * 100).toFixed(1)}% of dataset
                            </span>
                          </div>
                        </div>

                        {/* Strength Indicator */}
                        <div className="flex flex-col items-end gap-1">
                          <Badge className={getColor(corr.correlation_coefficient)}>
                            {getStrength(corr.correlation_coefficient)}
                          </Badge>
                          {/* Visual Bar */}
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all"
                              style={{ width: `${Math.min(corr.correlation_coefficient * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-xs">
                    <div className="space-y-2 text-xs">
                      <div>
                        <strong>Correlation Details</strong>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between gap-3">
                          <span className="text-muted-foreground">Attribute 1:</span>
                          <span className="font-mono">{corr.attribute1}</span>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span className="text-muted-foreground">Attribute 2:</span>
                          <span className="font-mono">{corr.attribute2}</span>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span className="text-muted-foreground">Co-occurrences:</span>
                          <strong>{corr.co_occurrence_count}</strong>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span className="text-muted-foreground">Coefficient:</span>
                          <strong>{(corr.correlation_coefficient * 100).toFixed(1)}%</strong>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span className="text-muted-foreground">Strength:</span>
                          <span className="font-medium">{getStrength(corr.correlation_coefficient)}</span>
                        </div>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center gap-2 mb-3 text-sm font-medium">
            <Info className="h-4 w-4" />
            <span>Correlation Strength</span>
          </div>
          <div className="flex flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-600" />
              <span className="text-muted-foreground">Very Strong (70%+)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-500" />
              <span className="text-muted-foreground">Strong (50-70%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-400" />
              <span className="text-muted-foreground">Moderate (30-50%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-300" />
              <span className="text-muted-foreground">Weak (&lt;30%)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
