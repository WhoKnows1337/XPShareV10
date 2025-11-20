import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface PatternsTabContentProps {
  patternSidebarContent: ReactNode;
  categoryMatches: number;
  locationMatches: number;
  temporalMatches: number;
  patternStrength: number;
}

export default function PatternsTabContent({
  patternSidebarContent,
  categoryMatches,
  locationMatches,
  temporalMatches,
  patternStrength,
}: PatternsTabContentProps) {
  return (
    <div className="container mx-auto px-4">
      <div className="space-y-6">
        <Card className="glass-card border-purple-500/20">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Pattern Analysis</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Overall Pattern Strength</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                      style={{ width: `${patternStrength}%` }}
                    />
                  </div>
                  <span className="text-lg font-semibold">{patternStrength}%</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-white/5 rounded-lg">
                  <p className="text-2xl font-bold">{categoryMatches}</p>
                  <p className="text-xs text-muted-foreground">Category</p>
                </div>
                <div className="text-center p-3 bg-white/5 rounded-lg">
                  <p className="text-2xl font-bold">{locationMatches}</p>
                  <p className="text-xs text-muted-foreground">Location</p>
                </div>
                <div className="text-center p-3 bg-white/5 rounded-lg">
                  <p className="text-2xl font-bold">{temporalMatches}</p>
                  <p className="text-xs text-muted-foreground">Temporal</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        {patternSidebarContent}
      </div>
    </div>
  );
}
