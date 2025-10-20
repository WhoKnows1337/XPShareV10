# XPShare AI - Advanced Features

**Version:** 1.0
**Related:** 02_AGENT_SYSTEM.md, 03_TOOLS_CATALOG.md

---

## 🎯 Overview

Advanced AI features: Insights, Predictions, Follow-ups, Exports

---

## 💡 Auto-Generated Insights

### Insight Agent Implementation

```typescript
// lib/agents/insight-agent.ts
import { openai } from '@ai-sdk/openai'
import { generateText, tool } from 'ai'
import { z } from 'zod'

const INSIGHT_AGENT_PROMPT = `You are XPShare Insight Specialist.

Capabilities:
1. Pattern Detection (temporal, geographic, semantic)
2. Correlation Analysis
3. Anomaly Detection
4. Trend Forecasting

Always provide confidence scores and evidence.`

export class InsightAgent {
  async execute(task: string, context: any) {
    const { text, toolCalls } = await generateText({
      model: openai('gpt-4o'),
      messages: [
        { role: 'system', content: INSIGHT_AGENT_PROMPT },
        { role: 'user', content: `${task}\n\nContext: ${JSON.stringify(context)}` },
      ],
      tools: {
        detect_pattern: tool({
          description: 'Detect patterns in data',
          parameters: z.object({
            patternType: z.enum(['temporal', 'geographic', 'semantic']),
            data: z.any(),
          }),
          execute: async ({ patternType, data }) => {
            return this.detectPattern(patternType, data)
          },
        }),

        generate_insight_card: tool({
          description: 'Generate insight card',
          parameters: z.object({
            title: z.string(),
            summary: z.string(),
            confidence: z.number().min(0).max(1),
            evidence: z.array(z.string()),
          }),
          execute: async (params) => ({
            type: 'insight_card',
            component: 'InsightCard',
            props: params,
          }),
        }),
      },
      maxSteps: 3,
    })

    return { text, insights: toolCalls }
  }

  private detectPattern(type: string, data: any) {
    switch (type) {
      case 'temporal':
        return this.detectTemporalPattern(data)
      case 'geographic':
        return this.detectGeographicPattern(data)
      case 'semantic':
        return this.detectSemanticPattern(data)
    }
  }

  private detectTemporalPattern(data: any[]) {
    // Group by month and find peaks
    const monthlyCounts = new Map<string, number>()

    data.forEach((exp) => {
      if (exp.date_occurred) {
        const month = exp.date_occurred.substring(5, 7) // MM
        monthlyCounts.set(month, (monthlyCounts.get(month) || 0) + 1)
      }
    })

    const avg = Array.from(monthlyCounts.values()).reduce((a, b) => a + b, 0) / 12
    const peaks = Array.from(monthlyCounts.entries())
      .filter(([_, count]) => count > avg * 1.5)
      .map(([month, count]) => ({ month, count }))

    return {
      pattern: 'seasonal',
      peaks,
      confidence: peaks.length > 0 ? 0.8 : 0.3,
    }
  }

  private detectGeographicPattern(data: any[]) {
    const locationCounts = new Map<string, number>()

    data.forEach((exp) => {
      if (exp.location_text) {
        locationCounts.set(exp.location_text, (locationCounts.get(exp.location_text) || 0) + 1)
      }
    })

    const hotspots = Array.from(locationCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    return {
      pattern: 'geographic_clustering',
      hotspots,
      confidence: hotspots.length > 0 ? 0.85 : 0.2,
    }
  }

  private detectSemanticPattern(data: any[]) {
    // Analyze common tags
    const tagCounts = new Map<string, number>()

    data.forEach((exp) => {
      exp.tags?.forEach((tag: string) => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
      })
    })

    const commonTags = Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)

    return {
      pattern: 'common_themes',
      tags: commonTags,
      confidence: 0.7,
    }
  }
}
```

### Insight Card Component

```typescript
// components/discover/InsightCard.tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Lightbulb } from 'lucide-react'

interface InsightCardProps {
  title: string
  summary: string
  confidence: number
  evidence: string[]
}

export function InsightCard({ title, summary, confidence, evidence }: InsightCardProps) {
  const confidenceColor =
    confidence >= 0.8 ? 'bg-green-500' :
    confidence >= 0.6 ? 'bg-yellow-500' :
    'bg-orange-500'

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">{title}</CardTitle>
          </div>
          <Badge className={confidenceColor}>
            {Math.round(confidence * 100)}% confidence
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm">{summary}</p>

        {evidence.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">Evidence:</div>
            <ul className="text-xs space-y-1">
              {evidence.map((item, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-muted-foreground">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

---

## 📊 Trend Prediction

```typescript
// lib/tools/predict-trends.ts
import { tool } from 'ai'
import { z } from 'zod'

export const predictTrendsTool = tool({
  description: 'Predict future trends based on historical data',
  parameters: z.object({
    category: z.string(),
    historicalData: z.array(z.object({
      date: z.string(),
      count: z.number(),
    })),
    forecastMonths: z.number().min(1).max(12).default(3),
  }),
  execute: async ({ category, historicalData, forecastMonths }) => {
    // Simple linear regression for trend prediction
    const predictions = forecastTrend(historicalData, forecastMonths)

    return {
      category,
      predictions,
      confidence: calculateConfidence(historicalData),
      method: 'linear_regression',
    }
  },
})

function forecastTrend(
  historical: Array<{ date: string; count: number }>,
  months: number
) {
  // Calculate trend using linear regression
  const n = historical.length
  const sumX = historical.reduce((sum, _, i) => sum + i, 0)
  const sumY = historical.reduce((sum, d) => sum + d.count, 0)
  const sumXY = historical.reduce((sum, d, i) => sum + i * d.count, 0)
  const sumX2 = historical.reduce((sum, _, i) => sum + i * i, 0)

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  // Generate predictions
  const predictions = []
  const lastDate = new Date(historical[historical.length - 1].date)

  for (let i = 1; i <= months; i++) {
    const futureDate = new Date(lastDate)
    futureDate.setMonth(futureDate.getMonth() + i)

    const predictedCount = Math.max(0, Math.round(slope * (n + i) + intercept))

    predictions.push({
      date: futureDate.toISOString().substring(0, 7),
      predicted_count: predictedCount,
    })
  }

  return predictions
}

function calculateConfidence(data: Array<{ count: number }>): number {
  // Calculate R² to determine confidence
  const mean = data.reduce((sum, d) => sum + d.count, 0) / data.length
  const variance = data.reduce((sum, d) => sum + Math.pow(d.count - mean, 2), 0)

  // Normalize to 0-1 confidence score
  return Math.min(1, Math.max(0.3, 1 - (variance / (mean * mean + 1))))
}
```

---

## 🔮 Follow-Up Suggestions

```typescript
// lib/tools/suggest-followups.ts
import { tool } from 'ai'
import { z } from 'zod'
import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'

export const suggestFollowupsTool = tool({
  description: 'Suggest intelligent follow-up questions',
  parameters: z.object({
    currentQuery: z.string(),
    results: z.any(),
    conversationHistory: z.array(z.any()).optional(),
  }),
  execute: async ({ currentQuery, results, conversationHistory }) => {
    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      messages: [
        {
          role: 'system',
          content: `Generate 3-5 insightful follow-up questions based on current results.

Make questions:
- Specific and actionable
- Explore different dimensions (time, location, attributes)
- Build on discovered patterns
- Avoid repetition of current query`,
        },
        {
          role: 'user',
          content: `
Current Query: ${currentQuery}

Results Summary:
- Total: ${results.count || results.length}
- Categories: ${results.categories?.join(', ') || 'N/A'}
- Has Geographic: ${results.hasGeo || false}
- Has Temporal: ${results.hasTemporal || false}

Generate follow-up questions as JSON array:
["Question 1", "Question 2", ...]
          `,
        },
      ],
      temperature: 0.7,
    })

    const suggestions = JSON.parse(text)

    return {
      suggestions,
      based_on: currentQuery,
      result_count: results.count || results.length,
    }
  },
})
```

### Follow-Up UI Component

```typescript
// components/discover/FollowUpSuggestions.tsx
import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'

interface FollowUpSuggestionsProps {
  suggestions: string[]
  onSelect: (suggestion: string) => void
}

export function FollowUpSuggestions({ suggestions, onSelect }: FollowUpSuggestionsProps) {
  return (
    <div className="space-y-2">
      <div className="text-xs font-medium text-muted-foreground">
        Suggested follow-ups:
      </div>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, i) => (
          <Button
            key={i}
            variant="outline"
            size="sm"
            className="text-xs h-auto py-2"
            onClick={() => onSelect(suggestion)}
          >
            <span className="mr-1">{suggestion}</span>
            <ChevronRight className="h-3 w-3" />
          </Button>
        ))}
      </div>
    </div>
  )
}
```

---

## 📥 Export Functionality

```typescript
// lib/tools/export-results.ts
import { tool } from 'ai'
import { z } from 'zod'

export const exportResultsTool = tool({
  description: 'Export results in various formats',
  parameters: z.object({
    data: z.any(),
    format: z.enum(['json', 'csv', 'pdf']),
    filename: z.string().optional(),
  }),
  execute: async ({ data, format, filename }) => {
    const defaultFilename = `xpshare-export-${Date.now()}`

    switch (format) {
      case 'json':
        return {
          format: 'json',
          filename: `${filename || defaultFilename}.json`,
          content: JSON.stringify(data, null, 2),
          downloadUrl: generateDownloadUrl(JSON.stringify(data), 'application/json'),
        }

      case 'csv':
        const csv = convertToCSV(data)
        return {
          format: 'csv',
          filename: `${filename || defaultFilename}.csv`,
          content: csv,
          downloadUrl: generateDownloadUrl(csv, 'text/csv'),
        }

      case 'pdf':
        // Use jsPDF or similar
        return {
          format: 'pdf',
          filename: `${filename || defaultFilename}.pdf`,
          message: 'PDF export not yet implemented',
        }
    }
  },
})

function convertToCSV(data: any[]): string {
  if (data.length === 0) return ''

  const headers = Object.keys(data[0])
  const rows = data.map((item) =>
    headers.map((header) => {
      const value = item[header]
      return typeof value === 'string' && value.includes(',')
        ? `"${value}"`
        : value
    }).join(',')
  )

  return [headers.join(','), ...rows].join('\n')
}

function generateDownloadUrl(content: string, mimeType: string): string {
  const blob = new Blob([content], { type: mimeType })
  return URL.createObjectURL(blob)
}
```

### Export UI Component

```typescript
// components/discover/ExportButton.tsx
'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Download } from 'lucide-react'

interface ExportButtonProps {
  data: any[]
  filename?: string
}

export function ExportButton({ data, filename }: ExportButtonProps) {
  const handleExport = (format: 'json' | 'csv') => {
    const defaultFilename = `xpshare-export-${Date.now()}`

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      downloadBlob(blob, `${filename || defaultFilename}.json`)
    } else if (format === 'csv') {
      const csv = convertToCSV(data)
      const blob = new Blob([csv], { type: 'text/csv' })
      downloadBlob(blob, `${filename || defaultFilename}.csv`)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleExport('json')}>
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('csv')}>
          Export as CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function convertToCSV(data: any[]): string {
  if (data.length === 0) return ''
  const headers = Object.keys(data[0])
  const rows = data.map((item) =>
    headers.map((h) => {
      const val = item[h]
      return typeof val === 'string' && val.includes(',') ? `"${val}"` : val
    }).join(',')
  )
  return [headers.join(','), ...rows].join('\n')
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
```

---

**Next:** See 07_IMPLEMENTATION_PHASES.md for roadmap.
