# XPChat Visualizations

**Directory:** `components/xpchat/visualizations/*`
**Libraries:** Recharts, react-map-gl, react-force-graph-2d

---

## Overview

**⚠️ UI/UX Improvement:** Consolidated from 11 → 5 core visualizations for simplicity and mobile-first design.

XPChat uses 5 core visualization components to render tool results:

| Tool | Visualization Component | Purpose | Consolidates |
|------|------------------------|---------|--------------|
| unifiedSearch, connections, patterns | **ExperienceCards** | Unified card-based display | ResultsList + ConnectionsView + PatternsView |
| visualize (map) | **MapView** | Geographic data with mobile fallbacks | MapView (enhanced) |
| visualize (timeline), trends | **TimelineView** | Temporal trends + forecasting + annotations | TimelineView + TrendsView |
| visualize (network) | **NetworkView** | Relationship graph with mobile fallbacks | NetworkView (enhanced) |
| visualize (dashboard), analyze, insights, userStats | **InsightsPanel** | Unified metrics, stats, and insights | DashboardView + AnalysisView + InsightsView + UserStatsView |

**Key Benefits:**
- ✅ Simpler codebase (5 instead of 11 components)
- ✅ Consistent UX patterns (card-based, tab-based)
- ✅ Mobile-first fallbacks for complex visualizations
- ✅ Easier maintenance and testing

---

## 1. ExperienceCards Component (Unified)

**Purpose:** Unified card-based display for search results, connections, and patterns

**Consolidates:** ResultsList, ConnectionsView, PatternsView

**Props:**
```typescript
type ExperienceCardsProps = {
  experiences: Experience[]
  type: 'search' | 'connections' | 'patterns'
  highlightedFields?: string[] // For pattern highlighting
  similarityScores?: Record<string, number> // For connections
}
```

```typescript
// components/xpchat/visualizations/ResultsList.tsx

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, User } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'

type Experience = {
  id: string
  title: string
  category: string
  location_text?: string
  created_at: string
  user_id: string
  content?: string
}

type ResultsListProps = {
  experiences: Experience[]
}

export function ResultsList({ experiences }: ResultsListProps) {
  if (!experiences || experiences.length === 0) {
    return (
      <Card className="p-8 text-center text-gray-500">
        Keine Ergebnisse gefunden
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {experiences.length} Ergebnisse
        </h3>
      </div>

      <div className="grid gap-3">
        {experiences.map((exp) => (
          <Card
            key={exp.id}
            className="p-4 hover:shadow-md transition-shadow cursor-pointer"
          >
            {/* Category Badge */}
            <div className="flex items-start justify-between mb-2">
              <Badge variant="secondary" className="text-xs">
                {getCategoryLabel(exp.category)}
              </Badge>
              <span className="text-xs text-gray-500">
                <Calendar className="inline h-3 w-3 mr-1" />
                {formatDistanceToNow(new Date(exp.created_at), {
                  addSuffix: true,
                  locale: de,
                })}
              </span>
            </div>

            {/* Title */}
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
              {exp.title}
            </h4>

            {/* Content Preview */}
            {exp.content && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                {exp.content}
              </p>
            )}

            {/* Metadata */}
            <div className="flex items-center gap-4 text-xs text-gray-500">
              {exp.location_text && (
                <span>
                  <MapPin className="inline h-3 w-3 mr-1" />
                  {exp.location_text}
                </span>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    'ufo-uap': 'UFO/UAP',
    dreams: 'Träume',
    psychic: 'Psychisch',
    nde: 'Nahtod',
    synchronicity: 'Synchronizität',
    other: 'Andere',
  }
  return labels[category] || category
}
```

---

## 2. MapView Component

**Purpose:** Display experiences on interactive Mapbox map

**Dependencies:**
```bash
npm install react-map-gl mapbox-gl
```

```typescript
// components/xpchat/visualizations/MapView.tsx

'use client'

import { useState } from 'react'
import Map, { Marker, Popup } from 'react-map-gl'
import { Card } from '@/components/ui/card'
import { MapPin } from 'lucide-react'
import 'mapbox-gl/dist/mapbox-gl.css'

type MapViewProps = {
  data: {
    type: 'FeatureCollection'
    features: Array<{
      type: 'Feature'
      geometry: {
        type: 'Point'
        coordinates: [number, number]
      }
      properties: {
        id: string
        title: string
        category: string
        location_text?: string
      }
    }>
  }
}

export function MapView({ data }: MapViewProps) {
  const [popupInfo, setPopupInfo] = useState<any>(null)

  // Calculate center from features
  const avgLng =
    data.features.reduce((sum, f) => sum + f.geometry.coordinates[0], 0) /
    data.features.length
  const avgLat =
    data.features.reduce((sum, f) => sum + f.geometry.coordinates[1], 0) /
    data.features.length

  return (
    <Card className="overflow-hidden">
      <div className="h-[500px] w-full">
        <Map
          initialViewState={{
            longitude: avgLng,
            latitude: avgLat,
            zoom: 6,
          }}
          mapStyle="mapbox://styles/mapbox/light-v11"
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
        >
          {/* Markers */}
          {data.features.map((feature, index) => (
            <Marker
              key={index}
              longitude={feature.geometry.coordinates[0]}
              latitude={feature.geometry.coordinates[1]}
              anchor="bottom"
              onClick={(e) => {
                e.originalEvent.stopPropagation()
                setPopupInfo(feature.properties)
              }}
            >
              <MapPin
                className="h-6 w-6 text-purple-600 cursor-pointer hover:scale-110 transition-transform"
                fill="currentColor"
              />
            </Marker>
          ))}

          {/* Popup */}
          {popupInfo && (
            <Popup
              longitude={
                data.features.find((f) => f.properties.id === popupInfo.id)!
                  .geometry.coordinates[0]
              }
              latitude={
                data.features.find((f) => f.properties.id === popupInfo.id)!
                  .geometry.coordinates[1]
              }
              onClose={() => setPopupInfo(null)}
              closeButton={true}
              closeOnClick={false}
            >
              <div className="p-2">
                <h4 className="font-medium text-sm mb-1">{popupInfo.title}</h4>
                <p className="text-xs text-gray-600">{popupInfo.category}</p>
                {popupInfo.location_text && (
                  <p className="text-xs text-gray-500 mt-1">
                    {popupInfo.location_text}
                  </p>
                )}
              </div>
            </Popup>
          )}
        </Map>
      </div>

      <div className="p-3 bg-gray-50 dark:bg-gray-800 border-t">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {data.features.length} Erlebnisse auf der Karte
        </p>
      </div>
    </Card>
  )
}
```

---

## 3. TimelineView Component

**Purpose:** Display temporal trends as line/area chart

**Dependencies:**
```bash
npm install recharts
```

```typescript
// components/xpchat/visualizations/TimelineView.tsx

import { Card } from '@/components/ui/card'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

type TimelineViewProps = {
  data: {
    chartData: Array<{
      date: string
      count: number
    }>
    type?: 'line' | 'area'
  }
}

export function TimelineView({ data }: TimelineViewProps) {
  const chartType = data.type || 'area'

  return (
    <Card className="p-4">
      <h3 className="text-sm font-medium mb-4">Zeitlicher Verlauf</h3>

      <ResponsiveContainer width="100%" height={300}>
        {chartType === 'area' ? (
          <AreaChart data={data.chartData}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis
              dataKey="date"
              tickFormatter={(value) =>
                format(new Date(value), 'MMM yyyy', { locale: de })
              }
            />
            <YAxis />
            <Tooltip
              labelFormatter={(value) =>
                format(new Date(value), 'PPP', { locale: de })
              }
              formatter={(value: number) => [value, 'Erlebnisse']}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#8b5cf6"
              fillOpacity={1}
              fill="url(#colorCount)"
            />
          </AreaChart>
        ) : (
          <LineChart data={data.chartData}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis
              dataKey="date"
              tickFormatter={(value) =>
                format(new Date(value), 'MMM yyyy', { locale: de })
              }
            />
            <YAxis />
            <Tooltip
              labelFormatter={(value) =>
                format(new Date(value), 'PPP', { locale: de })
              }
              formatter={(value: number) => [value, 'Erlebnisse']}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={{ fill: '#8b5cf6' }}
            />
          </LineChart>
        )}
      </ResponsiveContainer>

      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        Gesamt: {data.chartData.reduce((sum, d) => sum + d.count, 0)} Erlebnisse
      </div>
    </Card>
  )
}
```

---

## 4. NetworkView Component

**Purpose:** Display relationship network with force-directed layout

**Dependencies:**
```bash
npm install react-force-graph-2d
```

```typescript
// components/xpchat/visualizations/NetworkView.tsx

'use client'

import { useRef, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import dynamic from 'next/dynamic'

// Dynamic import to avoid SSR issues
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
})

type NetworkViewProps = {
  data: {
    nodes: Array<{
      id: string
      name: string
      category: string
      val?: number
    }>
    links: Array<{
      source: string
      target: string
      value: number
    }>
  }
}

export function NetworkView({ data }: NetworkViewProps) {
  const graphRef = useRef<any>()

  useEffect(() => {
    // Center graph after mount
    if (graphRef.current) {
      graphRef.current.zoomToFit(400)
    }
  }, [])

  return (
    <Card className="p-4">
      <h3 className="text-sm font-medium mb-4">Beziehungsnetzwerk</h3>

      <div className="h-[500px] w-full bg-gray-50 dark:bg-gray-900 rounded">
        <ForceGraph2D
          ref={graphRef}
          graphData={data}
          nodeLabel="name"
          nodeColor={(node: any) => getCategoryColor(node.category)}
          nodeRelSize={6}
          linkWidth={(link: any) => link.value}
          linkColor={() => '#94a3b8'}
          linkDirectionalParticles={2}
          linkDirectionalParticleWidth={2}
          backgroundColor="transparent"
        />
      </div>

      <div className="mt-4 flex items-center gap-4 text-sm">
        <div>
          <span className="font-medium">{data.nodes.length}</span> Knoten
        </div>
        <div>
          <span className="font-medium">{data.links.length}</span> Verbindungen
        </div>
      </div>
    </Card>
  )
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'ufo-uap': '#8b5cf6',
    dreams: '#3b82f6',
    psychic: '#ec4899',
    nde: '#f59e0b',
    synchronicity: '#10b981',
    other: '#6b7280',
  }
  return colors[category] || colors.other
}
```

---

## 5. DashboardView Component

**Purpose:** Display metrics grid with various chart types

```typescript
// components/xpchat/visualizations/DashboardView.tsx

import { Card } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts'

type DashboardViewProps = {
  data: {
    metrics: {
      totalExperiences: number
      categoryCounts: Array<{ name: string; value: number }>
      locationCounts: Array<{ name: string; value: number }>
      recentTrend: 'up' | 'down' | 'stable'
    }
  }
}

const COLORS = ['#8b5cf6', '#3b82f6', '#ec4899', '#f59e0b', '#10b981', '#6b7280']

export function DashboardView({ data }: DashboardViewProps) {
  const { metrics } = data

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Total Count Card */}
      <Card className="p-6">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
          Gesamt Erlebnisse
        </h3>
        <p className="text-4xl font-bold text-purple-600">
          {metrics.totalExperiences.toLocaleString('de-DE')}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Trend:{' '}
          {metrics.recentTrend === 'up' && '📈 Steigend'}
          {metrics.recentTrend === 'down' && '📉 Fallend'}
          {metrics.recentTrend === 'stable' && '➡️ Stabil'}
        </p>
      </Card>

      {/* Category Distribution Pie */}
      <Card className="p-4">
        <h3 className="text-sm font-medium mb-2">Kategorien</h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={metrics.categoryCounts}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry) => entry.name}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {metrics.categoryCounts.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      {/* Location Distribution Bar */}
      <Card className="p-4 md:col-span-2">
        <h3 className="text-sm font-medium mb-2">Top Locations</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={metrics.locationCounts.slice(0, 10)}>
            <Tooltip />
            <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}
```

---

## 6. AnalysisView Component

**Purpose:** Display statistical analysis results

```typescript
// components/xpchat/visualizations/AnalysisView.tsx

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type AnalysisViewProps = {
  data: {
    summary: string
    insights: string[]
    statistics?: Record<string, number>
    tableData?: Array<{ label: string; value: string | number }>
  }
  mode: 'temporal' | 'category' | 'compare' | 'correlation'
}

export function AnalysisView({ data, mode }: AnalysisViewProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-sm font-medium">Analyse</h3>
        <Badge variant="secondary" className="text-xs">
          {getModeLabel(mode)}
        </Badge>
      </div>

      {/* Summary */}
      {data.summary && (
        <div className="mb-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {data.summary}
          </p>
        </div>
      )}

      {/* Insights */}
      {data.insights && data.insights.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
            Wichtige Erkenntnisse
          </h4>
          <ul className="space-y-2">
            {data.insights.map((insight, index) => (
              <li
                key={index}
                className="text-sm flex items-start gap-2"
              >
                <span className="text-purple-600 mt-1">•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Statistics Table */}
      {data.statistics && (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <tbody>
              {Object.entries(data.statistics).map(([key, value]) => (
                <tr key={key} className="border-b last:border-b-0">
                  <td className="px-4 py-2 font-medium text-gray-700 dark:text-gray-300">
                    {key}
                  </td>
                  <td className="px-4 py-2 text-right text-gray-900 dark:text-gray-100">
                    {typeof value === 'number' ? value.toFixed(2) : value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Table Data */}
      {data.tableData && (
        <div className="border rounded-lg overflow-hidden mt-4">
          <table className="w-full text-sm">
            <tbody>
              {data.tableData.map((row, index) => (
                <tr key={index} className="border-b last:border-b-0">
                  <td className="px-4 py-2 font-medium">{row.label}</td>
                  <td className="px-4 py-2 text-right">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}

function getModeLabel(mode: string): string {
  const labels: Record<string, string> = {
    temporal: 'Zeitlich',
    category: 'Kategorie',
    compare: 'Vergleich',
    correlation: 'Korrelation',
  }
  return labels[mode] || mode
}
```

---

## 7-11. Simple Data Views

For the remaining specialized tools (insights, trends, connections, patterns, userStats), create simplified views:

```typescript
// components/xpchat/visualizations/InsightsView.tsx
import { Card } from '@/components/ui/card'
import { Lightbulb } from 'lucide-react'

export function InsightsView({ data }: { data: { insights: string[] } }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="h-4 w-4 text-yellow-600" />
        <h3 className="text-sm font-medium">KI-Erkenntnisse</h3>
      </div>
      <ul className="space-y-2">
        {data.insights.map((insight, i) => (
          <li key={i} className="text-sm bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded">
            {insight}
          </li>
        ))}
      </ul>
    </Card>
  )
}
```

```typescript
// components/xpchat/visualizations/TrendsView.tsx
import { TimelineView } from './TimelineView'

export function TrendsView({ data }: any) {
  return <TimelineView data={{ ...data, type: 'line' }} />
}
```

```typescript
// components/xpchat/visualizations/ConnectionsView.tsx
import { ResultsList } from './ResultsList'

export function ConnectionsView({ data }: { data: { similar: any[] } }) {
  return (
    <div>
      <h3 className="text-sm font-medium mb-3">Ähnliche Erlebnisse</h3>
      <ResultsList experiences={data.similar} />
    </div>
  )
}
```

```typescript
// components/xpchat/visualizations/PatternsView.tsx
import { Card } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'

export function PatternsView({ data }: { data: { anomalies: any[] } }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <h3 className="text-sm font-medium">Erkannte Muster</h3>
      </div>
      <ul className="space-y-2">
        {data.anomalies.map((anomaly, i) => (
          <li key={i} className="text-sm p-3 bg-orange-50 dark:bg-orange-900/20 rounded">
            {anomaly.description}
          </li>
        ))}
      </ul>
    </Card>
  )
}
```

```typescript
// components/xpchat/visualizations/UserStatsView.tsx
import { Card } from '@/components/ui/card'
import { Trophy } from 'lucide-react'

export function UserStatsView({ data }: { data: { leaderboard: any[] } }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <Trophy className="h-4 w-4 text-yellow-600" />
        <h3 className="text-sm font-medium">Top Contributors</h3>
      </div>
      <div className="space-y-2">
        {data.leaderboard.map((user, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-purple-600">#{i + 1}</span>
              <span className="text-sm font-medium">{user.name || 'Anonymous'}</span>
            </div>
            <span className="text-sm text-gray-600">{user.count} Erlebnisse</span>
          </div>
        ))}
      </div>
    </Card>
  )
}
```

---

## Dependencies Summary

```json
{
  "dependencies": {
    "react-map-gl": "^7.1.0",
    "mapbox-gl": "^3.0.0",
    "recharts": "^2.10.0",
    "react-force-graph-2d": "^1.25.0",
    "date-fns": "^3.0.0",
    "lucide-react": "^0.400.0"
  }
}
```

---

## Testing Checklist

- [ ] ResultsList renders search results
- [ ] MapView displays markers correctly
- [ ] MapView popups work on click
- [ ] TimelineView chart renders
- [ ] NetworkView graph renders (client-side only)
- [ ] DashboardView metrics display
- [ ] AnalysisView tables render
- [ ] All simple views render
- [ ] Responsive on mobile
- [ ] Dark mode works
- [ ] Loading states handled

---

## Performance Optimizations

### Lazy Loading
```typescript
const MapView = dynamic(() => import('./MapView'), {
  ssr: false,
  loading: () => <Skeleton className="h-[500px]" />
})
```

### Virtualization (for large lists)
```typescript
import { useVirtualizer } from '@tanstack/react-virtual'
```

### Memoization
```typescript
const MemoizedResultsList = React.memo(ResultsList)
```

---

## Consolidation Strategy & Mobile-First Design

### Why Consolidate from 11 → 5?

**Problems with 11 Components:**
- ❌ Maintenance complexity (11 separate files)
- ❌ Inconsistent UX patterns
- ❌ Mobile experience not considered
- ❌ Code duplication (e.g., card layouts in 3+ components)
- ❌ Difficult to add cross-cutting features (save, share, export)

**Benefits of 5 Components:**
- ✅ Single source of truth for card layouts
- ✅ Consistent mobile fallbacks
- ✅ Easier to add save/share buttons
- ✅ Simpler testing (5 instead of 11 test suites)
- ✅ Better performance (shared memoization)

---

### Mobile-First Fallbacks

#### MapView Mobile Strategy

```typescript
// components/xpchat/visualizations/MapView.tsx

export function MapView({ data }: MapViewProps) {
  const [showFullMap, setShowFullMap] = useState(false)
  const isMobile = useMediaQuery('(max-width: 768px)')

  if (isMobile && !showFullMap) {
    // Mobile: Show static preview + list
    return (
      <div className="space-y-3">
        {/* Static Map Preview */}
        <div className="relative h-48 rounded-lg overflow-hidden">
          <img
            src={`https://api.mapbox.com/styles/v1/mapbox/light-v11/static/${bounds}/400x200@2x?access_token=${token}`}
            alt="Map preview"
            className="w-full h-full object-cover"
          />
          <Button
            onClick={() => setShowFullMap(true)}
            className="absolute inset-0 w-full h-full bg-black/50 hover:bg-black/60 text-white"
          >
            🗺️ Karte in Vollbild öffnen ({data.features.length} Orte)
          </Button>
        </div>

        {/* Location List (Mobile-friendly) */}
        <div className="space-y-2">
          {data.features.map((f) => (
            <Card key={f.properties.id} className="p-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-purple-600" />
                <div className="flex-1">
                  <p className="font-medium text-sm">{f.properties.title}</p>
                  <p className="text-xs text-gray-500">{f.properties.location_text}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Desktop or fullscreen: Show interactive map
  return <InteractiveMapView data={data} onClose={() => setShowFullMap(false)} />
}
```

#### NetworkView Mobile Strategy

**Enhanced Mobile UX:** Category-grouped hierarchical list with expand/collapse

```typescript
// components/xpchat/visualizations/NetworkView.tsx

'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'

export function NetworkView({ data }: NetworkViewProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')

  if (isMobile) {
    return <NetworkViewMobile data={data} />
  }

  // Desktop: Show force-directed graph
  return <InteractiveNetworkGraph data={data} />
}

function NetworkViewMobile({ data }: NetworkViewProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  // Group nodes by category
  const nodesByCategory = data.nodes.reduce((acc, node) => {
    if (!acc[node.category]) acc[node.category] = []
    acc[node.category].push(node)
    return acc
  }, {} as Record<string, typeof data.nodes>)

  const toggleExpand = (nodeId: string) => {
    const newExpanded = new Set(expanded)
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId)
    } else {
      newExpanded.add(nodeId)
    }
    setExpanded(newExpanded)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Netzwerk: {data.nodes.length} Knoten, {data.links.length} Verbindungen
        </h3>
      </div>

      {/* Category-grouped nodes */}
      {Object.entries(nodesByCategory).map(([category, nodes]) => (
        <Card key={category}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span>{getCategoryLabel(category)}</span>
              <Badge variant="secondary">{nodes.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {nodes.map((node) => {
              const connections = data.links.filter(
                (link) => link.source === node.id || link.target === node.id
              )
              const isExpanded = expanded.has(node.id)

              return (
                <div key={node.id} className="border-l-2 border-purple-200 pl-3">
                  {/* Node Header (collapsible) */}
                  <button
                    onClick={() => toggleExpand(node.id)}
                    className="flex items-center justify-between w-full py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition-colors"
                    style={{ minHeight: '44px', minWidth: '44px' }} // Touch target
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <ChevronRight
                        className={`h-4 w-4 transition-transform ${
                          isExpanded ? 'rotate-90' : ''
                        }`}
                      />
                      <span className="font-medium text-sm">{node.name}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {connections.length} {connections.length === 1 ? 'Verbindung' : 'Verbindungen'}
                    </Badge>
                  </button>

                  {/* Expanded: Show connections */}
                  {isExpanded && connections.length > 0 && (
                    <div className="ml-6 mt-2 space-y-1 pb-2">
                      {connections.map((link, idx) => {
                        const connectedNodeId =
                          link.source === node.id ? link.target : link.source
                        const connectedNode = data.nodes.find((n) => n.id === connectedNodeId)

                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-xs py-1.5 px-2 bg-gray-50 dark:bg-gray-800 rounded"
                          >
                            <span className="text-gray-700 dark:text-gray-300">
                              → {connectedNode?.name || 'Unknown'}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {Math.round((link.value || 0) * 100)}% Ähnlichkeit
                            </Badge>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>
      ))}

      {/* Desktop fallback button */}
      <Button
        variant="outline"
        className="w-full"
        onClick={() => window.open('/network-fullscreen', '_blank')}
      >
        📊 Grafik in Desktop-Ansicht öffnen
      </Button>
    </div>
  )
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    'ufo-uap': 'UFO/UAP',
    dreams: 'Träume',
    psychic: 'Psychisch',
    nde: 'Nahtod',
    synchronicity: 'Synchronizität',
    other: 'Andere',
  }
  return labels[category] || category
}
```

**Mobile UX Features:**
- ✅ Category-grouped Card layout for better organization
- ✅ Expand/collapse with ChevronRight rotation animation
- ✅ Connection counts displayed as badges
- ✅ Similarity percentages shown for each connection
- ✅ Touch-optimized tap targets (44×44px minimum)
- ✅ Fallback button to open desktop view in new tab
- ✅ Responsive breakpoint detection (< 768px)

**Design Mockup:**

```
┌─────────────────────────────────────┐
│ Netzwerk: 12 Knoten, 18 Verbindungen│
├─────────────────────────────────────┤
│ ┌─ UFO/UAP ──────────────────── 4 ─┐│
│ │ › UFO Berlin (3 Verbindungen)    ││
│ │ ∨ UFO Paris (5 Verbindungen)     ││
│ │   → UFO Berlin [85% Ähnlichkeit] ││
│ │   → Dream UFO  [72% Ähnlichkeit] ││
│ │   → ...                          ││
│ └──────────────────────────────────┘│
│ ┌─ Träume ───────────────────── 3 ─┐│
│ │ › Dream UFO (2 Verbindungen)     ││
│ │ › Dream Berlin (1 Verbindung)    ││
│ └──────────────────────────────────┘│
├─────────────────────────────────────┤
│ [📊 Grafik in Desktop-Ansicht öffnen]│
└─────────────────────────────────────┘
```

---

### Pattern Library Integration

Every visualization component should support **saving patterns** for later reference.

```typescript
// components/xpchat/visualizations/SavePatternButton.tsx

type SavePatternButtonProps = {
  pattern: {
    type: 'search' | 'geographic' | 'temporal' | 'network' | 'insight'
    title: string
    data: any
    visualization: React.ReactNode
    query: string
  }
}

export function SavePatternButton({ pattern }: SavePatternButtonProps) {
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    await fetch('/api/patterns/save', {
      method: 'POST',
      body: JSON.stringify({
        type: pattern.type,
        title: pattern.title,
        data: pattern.data,
        query: pattern.query,
        created_at: new Date().toISOString(),
      }),
    })
    setSaved(true)
  }

  return (
    <Button
      size="sm"
      variant={saved ? 'secondary' : 'default'}
      onClick={handleSave}
      disabled={saved}
    >
      {saved ? (
        <>
          <Check className="h-4 w-4 mr-1" />
          Gespeichert
        </>
      ) : (
        <>
          <Bookmark className="h-4 w-4 mr-1" />
          Muster speichern
        </>
      )}
    </Button>
  )
}
```

**Usage in components:**

```typescript
export function ExperienceCards({ experiences, type }: ExperienceCardsProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3>{experiences.length} Ergebnisse</h3>

        <SavePatternButton
          pattern={{
            type: 'search',
            title: `${type} results (${experiences.length})`,
            data: experiences,
            visualization: <ExperienceCards experiences={experiences} type={type} />,
            query: window.location.search,
          }}
        />
      </div>

      {/* ... rest of component */}
    </div>
  )
}
```

---

### Visualization Architecture (Updated)

```
ToolRenderer
     │
     ├─ ExperienceCards (unified)
     │  ├─ type="search" → Search results layout
     │  ├─ type="connections" → Similarity scores shown
     │  └─ type="patterns" → Highlighted fields shown
     │
     ├─ MapView
     │  ├─ Desktop: Interactive Mapbox
     │  └─ Mobile: Static preview + location list
     │
     ├─ TimelineView (enhanced)
     │  ├─ Area chart with trend line
     │  ├─ Forecast layer (from TrendsView)
     │  └─ "Aha Moment" annotations
     │
     ├─ NetworkView
     │  ├─ Desktop: Force-directed graph
     │  └─ Mobile: Hierarchical list
     │
     └─ InsightsPanel (tabs)
        ├─ Tab: Stats (from DashboardView)
        ├─ Tab: Insights (from InsightsView)
        └─ Tab: Analysis (from AnalysisView)
```

---

## Next Steps

After implementing visualizations:

1. ✅ Consolidate components: 11 → 5
2. ✅ Add mobile-first fallbacks for MapView & NetworkView
3. ✅ Integrate SavePatternButton in all visualizations
4. ⏸️ Create testing documentation (see `07-TESTING.md`)
5. ⏸️ Optimize performance for large datasets
6. ⏸️ Add export functionality (CSV, PNG, etc.)
7. ⏸️ Implement Pattern Library page (see `09-PATTERN-LIBRARY.md`)

---

**Status:** Enhanced with UI/UX Improvements ✅
