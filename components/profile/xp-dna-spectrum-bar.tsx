'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { getCategoryColor } from '@/lib/constants/categories'

interface XPDNASpectrumBarProps {
  categoryDistribution: Record<string, number>
}

export function XPDNASpectrumBar({ categoryDistribution }: XPDNASpectrumBarProps) {
  const total = Object.values(categoryDistribution).reduce((sum, count) => sum + count, 0)

  if (total === 0) {
    return null
  }

  const segments = Object.entries(categoryDistribution)
    .sort(([, a], [, b]) => b - a)
    .map(([category, count]) => ({
      category,
      percentage: (count / total) * 100,
      count,
      color: getCategoryColor(category),
    }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>XP DNA Spectrum</CardTitle>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="flex h-12 w-full rounded-lg overflow-hidden">
            {segments.map((segment) => (
              <Tooltip key={segment.category}>
                <TooltipTrigger asChild>
                  <div
                    style={{
                      width: `${segment.percentage}%`,
                      backgroundColor: segment.color,
                    }}
                    className="transition-all hover:opacity-80 cursor-pointer"
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-semibold">{segment.category}</p>
                  <p className="text-sm">{segment.count} experiences ({segment.percentage.toFixed(1)}%)</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {segments.slice(0, 5).map((segment) => (
              <div key={segment.category} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: segment.color }}
                />
                <span className="text-xs text-muted-foreground">
                  {segment.category} ({segment.percentage.toFixed(0)}%)
                </span>
              </div>
            ))}
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  )
}
