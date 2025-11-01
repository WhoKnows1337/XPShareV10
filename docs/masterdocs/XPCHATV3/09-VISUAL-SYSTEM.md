# XPChat v3 - Visual System & Design Rules

**Status:** Planning Phase
**Created:** 2025-10-26

> **Design System Context:** Diese Visualizations werden in das moderne Chat-Interface integriert. Siehe [17-DESIGN-SYSTEM-2025.md](./17-DESIGN-SYSTEM-2025.md) für UI-Komponenten, Animationen, Dark Mode, und Accessibility-Patterns.

---

## 🎨 Design Philosophy

**Kernprinzip:** Visualisierungen sind nicht Dekoration - sie sind **Erkenntnismaschinen**.

```
Text → Shows WHAT
Visualizations → Shows WHY, HOW, WHERE, WHEN
```

**Regel #1:** Jede Visualization muss eine Frage beantworten
**Regel #2:** Context bestimmt die richtige Visualization
**Regel #3:** Progressive Disclosure (nicht alles auf einmal)

---

## 🗺️ The 5 Core Visualizations

### 1. Map View (Geographic Discovery)

**Wann zeigen?**
```typescript
const shouldShowMap = (query: string, results: Experience[]) => {
  // Trigger Words
  const geoKeywords = ['wo', 'ort', 'region', 'stadt', 'land', 'karte']
  const hasGeoKeyword = geoKeywords.some(kw => query.toLowerCase().includes(kw))

  // Data has geo coordinates
  const hasGeoData = results.filter(r => r.lat && r.lng).length > 3

  return hasGeoKeyword || hasGeoData
}
```

**Was zeigt es?**
- Where are experiences concentrated?
- Are there hotspots?
- Geographic patterns?

**Component:**

```typescript
'use client'

import mapboxgl from 'mapbox-gl'
import { useEffect, useRef } from 'react'

interface MapViewProps {
  experiences: Experience[]
  interactive?: boolean
  height?: string
}

export function MapView({ experiences, interactive = true, height = '400px' }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)

  useEffect(() => {
    if (!mapContainer.current) return

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [10.5, 51.1], // Germany center
      zoom: 5,
    })

    // Create GeoJSON from experiences
    const geoJSON: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: experiences
        .filter(exp => exp.lat && exp.lng)
        .map(exp => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [exp.lng, exp.lat]
          },
          properties: {
            id: exp.id,
            title: exp.title,
            category: exp.category,
            date: exp.date_occurred,
          }
        }))
    }

    // Add source
    map.current.on('load', () => {
      map.current!.addSource('experiences', {
        type: 'geojson',
        data: geoJSON,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50
      })

      // Cluster circles
      map.current!.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'experiences',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#51bbd6', 10,
            '#f1f075', 20,
            '#f28cb1'
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            20, 10,
            30, 20,
            40
          ]
        }
      })

      // Cluster count
      map.current!.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'experiences',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12
        }
      })

      // Individual points
      map.current!.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'experiences',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': '#11b4da',
          'circle-radius': 8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff'
        }
      })

      // Fit bounds to data
      if (geoJSON.features.length > 0) {
        const bounds = new mapboxgl.LngLatBounds()
        geoJSON.features.forEach(feature => {
          bounds.extend(feature.geometry.coordinates as [number, number])
        })
        map.current!.fitBounds(bounds, { padding: 50 })
      }
    })

    // Click handler
    if (interactive) {
      map.current.on('click', 'unclustered-point', (e) => {
        const feature = e.features![0]
        const { id, title, category } = feature.properties!

        new mapboxgl.Popup()
          .setLngLat(feature.geometry.coordinates)
          .setHTML(`
            <div class="p-2">
              <h3 class="font-bold">${title}</h3>
              <p class="text-sm text-gray-600">${category}</p>
              <a href="/experiences/${id}" class="text-blue-500">Details →</a>
            </div>
          `)
          .addTo(map.current!)
      })

      // Cursor
      map.current.on('mouseenter', 'unclustered-point', () => {
        map.current!.getCanvas().style.cursor = 'pointer'
      })
      map.current.on('mouseleave', 'unclustered-point', () => {
        map.current!.getCanvas().style.cursor = ''
      })
    }

    return () => {
      map.current?.remove()
    }
  }, [experiences, interactive])

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold">Geografische Verteilung</h3>
        <span className="text-sm text-gray-600">
          {experiences.filter(e => e.lat && e.lng).length} Orte
        </span>
      </div>
      <div
        ref={mapContainer}
        style={{ height }}
        className="rounded-lg overflow-hidden border"
      />
    </div>
  )
}
```

---

### 2. Timeline View (Temporal Discovery)

**Wann zeigen?**
```typescript
const shouldShowTimeline = (query: string, results: Experience[]) => {
  // Trigger Words
  const temporalKeywords = ['wann', 'zeit', 'datum', 'jahr', 'monat', 'trend', 'verlauf']
  const hasTemporalKeyword = temporalKeywords.some(kw => query.toLowerCase().includes(kw))

  // Data has dates
  const hasDates = results.filter(r => r.date_occurred).length > 3

  return hasTemporalKeyword || hasDates
}
```

**Was zeigt es?**
- When do experiences happen?
- Are there temporal patterns?
- Trends over time?

**Component:**

```typescript
'use client'

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format, parseISO, startOfMonth, startOfDay } from 'date-fns'
import { de } from 'date-fns/locale'

interface TimelineViewProps {
  experiences: Experience[]
  groupBy?: 'day' | 'month' | 'year'
  type?: 'line' | 'bar'
}

export function TimelineView({ experiences, groupBy = 'month', type = 'line' }: TimelineViewProps) {
  // Aggregate data by time period
  const data = useMemo(() => {
    const counts = new Map<string, number>()

    experiences.forEach(exp => {
      if (!exp.date_occurred) return

      const date = parseISO(exp.date_occurred)
      let key: string

      if (groupBy === 'day') {
        key = format(startOfDay(date), 'yyyy-MM-dd')
      } else if (groupBy === 'month') {
        key = format(startOfMonth(date), 'yyyy-MM')
      } else {
        key = format(date, 'yyyy')
      }

      counts.set(key, (counts.get(key) || 0) + 1)
    })

    return Array.from(counts.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [experiences, groupBy])

  // Format dates for display
  const formatDate = (dateStr: string) => {
    const date = parseISO(dateStr)
    if (groupBy === 'day') return format(date, 'd. MMM', { locale: de })
    if (groupBy === 'month') return format(date, 'MMM yyyy', { locale: de })
    return format(date, 'yyyy')
  }

  // Find peak
  const peak = data.reduce((max, curr) => curr.count > max.count ? curr : max, data[0])

  const Chart = type === 'line' ? LineChart : BarChart
  const ChartElement = type === 'line' ? Line : Bar

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold">Zeitlicher Verlauf</h3>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={groupBy === 'day' ? 'default' : 'outline'}
            onClick={() => setGroupBy('day')}
          >
            Tag
          </Button>
          <Button
            size="sm"
            variant={groupBy === 'month' ? 'default' : 'outline'}
            onClick={() => setGroupBy('month')}
          >
            Monat
          </Button>
          <Button
            size="sm"
            variant={groupBy === 'year' ? 'default' : 'outline'}
            onClick={() => setGroupBy('year')}
          >
            Jahr
          </Button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <Chart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
          />
          <YAxis />
          <Tooltip
            labelFormatter={formatDate}
            formatter={(value: number) => [`${value} Erlebnisse`, 'Anzahl']}
          />
          <ChartElement
            type="monotone"
            dataKey="count"
            stroke="#8884d8"
            fill="#8884d8"
            strokeWidth={2}
          />
        </Chart>
      </ResponsiveContainer>

      {/* Insight */}
      <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm">
        <strong>Peak:</strong> {formatDate(peak.date)} mit {peak.count} Erlebnissen
      </div>
    </div>
  )
}
```

---

### 3. Dashboard View (Statistical Overview)

**Wann zeigen?**
```typescript
const shouldShowDashboard = (query: string, results: Experience[]) => {
  // Trigger Words
  const statsKeywords = ['übersicht', 'statistik', 'zusammenfassung', 'dashboard', 'alle']
  const hasStatsKeyword = statsKeywords.some(kw => query.toLowerCase().includes(kw))

  // Large dataset
  const hasLargeDataset = results.length > 50

  return hasStatsKeyword || hasLargeDataset
}
```

**Was zeigt es?**
- What's the big picture?
- Distribution by category?
- Key metrics?

**Component:**

```typescript
'use client'

interface DashboardViewProps {
  experiences: Experience[]
}

export function DashboardView({ experiences }: DashboardViewProps) {
  const stats = useMemo(() => {
    // Category distribution
    const byCategory = experiences.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Location distribution (top 10)
    const byLocation = experiences.reduce((acc, exp) => {
      if (exp.location) {
        acc[exp.location] = (acc[exp.location] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    const topLocations = Object.entries(byLocation)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([location, count]) => ({ location, count }))

    // Time range
    const dates = experiences
      .map(e => e.date_occurred)
      .filter(Boolean)
      .map(d => parseISO(d))
      .sort((a, b) => a.getTime() - b.getTime())

    return {
      total: experiences.length,
      byCategory,
      topLocations,
      timeRange: dates.length > 0 ? {
        earliest: format(dates[0], 'MMM yyyy', { locale: de }),
        latest: format(dates[dates.length - 1], 'MMM yyyy', { locale: de })
      } : null
    }
  }, [experiences])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="font-semibold text-lg">Übersicht</h3>
        <p className="text-gray-600 text-sm">
          {stats.total} Erlebnisse{' '}
          {stats.timeRange && (
            <>von {stats.timeRange.earliest} bis {stats.timeRange.latest}</>
          )}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Gesamt"
          value={stats.total}
          icon={<Database className="w-5 h-5" />}
        />
        <MetricCard
          label="Kategorien"
          value={Object.keys(stats.byCategory).length}
          icon={<Grid className="w-5 h-5" />}
        />
        <MetricCard
          label="Orte"
          value={Object.keys(stats.topLocations).length}
          icon={<MapPin className="w-5 h-5" />}
        />
        <MetricCard
          label="Zeitspanne"
          value={stats.timeRange ? `${format(parseISO(stats.timeRange.earliest), 'yyyy')}-${format(parseISO(stats.timeRange.latest), 'yyyy')}` : '-'}
          icon={<Calendar className="w-5 h-5" />}
        />
      </div>

      {/* Category Distribution */}
      <div>
        <h4 className="font-medium mb-2">Verteilung nach Kategorie</h4>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={Object.entries(stats.byCategory).map(([category, count]) => ({
              category,
              count
            }))}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Locations */}
      {stats.topLocations.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">Top Orte</h4>
          <div className="space-y-2">
            {stats.topLocations.map(({ location, count }, index) => (
              <div key={location} className="flex items-center gap-2">
                <span className="text-gray-500 w-6 text-sm">#{index + 1}</span>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span className="text-sm">{location}</span>
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full mt-1">
                    <div
                      className="h-2 bg-blue-500 rounded-full"
                      style={{ width: `${(count / stats.total) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

---

### 4. Network View (Connection Discovery)

**Wann zeigen?**
```typescript
const shouldShowNetwork = (query: string, results: Experience[]) => {
  // Trigger Words
  const connectionKeywords = ['zusammenhang', 'verbindung', 'beziehung', 'netzwerk', 'cluster']
  const hasConnectionKeyword = connectionKeywords.some(kw => query.toLowerCase().includes(kw))

  // Multiple categories
  const categories = new Set(results.map(r => r.category))
  const hasMultipleCategories = categories.size > 1

  return hasConnectionKeyword || hasMultipleCategories
}
```

**Was zeigt es?**
- How are experiences connected?
- Cross-category patterns?
- User networks?

**Component:**

```typescript
'use client'

import { ForceGraph2D } from 'react-force-graph'

interface NetworkViewProps {
  experiences: Experience[]
  mode: 'category' | 'user' | 'semantic'
}

export function NetworkView({ experiences, mode = 'category' }: NetworkViewProps) {
  const graphData = useMemo(() => {
    if (mode === 'category') {
      // Nodes = categories, edges = shared experiences
      const categories = Array.from(new Set(experiences.map(e => e.category)))
      const nodes = categories.map(cat => ({
        id: cat,
        name: cat,
        val: experiences.filter(e => e.category === cat).length
      }))

      const links = []
      // Find cross-category connections (same user, similar content)
      for (let i = 0; i < categories.length; i++) {
        for (let j = i + 1; j < categories.length; j++) {
          const cat1 = categories[i]
          const cat2 = categories[j]

          // Count users with experiences in both categories
          const sharedUsers = new Set(
            experiences
              .filter(e => e.category === cat1)
              .map(e => e.user_id)
          )
          const connections = experiences
            .filter(e => e.category === cat2 && sharedUsers.has(e.user_id))
            .length

          if (connections > 0) {
            links.push({
              source: cat1,
              target: cat2,
              value: connections
            })
          }
        }
      }

      return { nodes, links }
    }

    // Add user and semantic modes...
    return { nodes: [], links: [] }
  }, [experiences, mode])

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold">Netzwerk-Analyse</h3>
        <Select value={mode} onValueChange={setMode}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="category">Kategorien</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="semantic">Semantisch</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <ForceGraph2D
          graphData={graphData}
          nodeLabel="name"
          nodeAutoColorBy="id"
          linkWidth={link => link.value}
          linkDirectionalParticles={2}
          width={600}
          height={400}
        />
      </div>

      {/* Legend */}
      <div className="mt-2 text-sm text-gray-600">
        Größe = Anzahl Erlebnisse • Verbindungen = Geteilte User
      </div>
    </div>
  )
}
```

---

### 5. Comparison View (Side-by-Side)

**Wann zeigen?**
```typescript
const shouldShowComparison = (query: string, results: Experience[]) => {
  // Trigger Words
  const comparisonKeywords = ['vergleich', 'unterschied', 'vs', 'gegen', 'gemeinsamkeit']
  return comparisonKeywords.some(kw => query.toLowerCase().includes(kw))
}
```

**Was zeigt es?**
- How do two experiences/categories compare?
- What's different, what's similar?

**Component:**

```typescript
'use client'

interface ComparisonViewProps {
  itemA: Experience | Category
  itemB: Experience | Category
}

export function ComparisonView({ itemA, itemB }: ComparisonViewProps) {
  const comparison = useMemo(() => {
    // Extract comparable features
    return {
      similarities: findSimilarities(itemA, itemB),
      differences: findDifferences(itemA, itemB),
      score: calculateSimilarityScore(itemA, itemB)
    }
  }, [itemA, itemB])

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Left Item */}
      <Card>
        <CardHeader>
          <CardTitle>{itemA.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <ExperienceDetails experience={itemA} />
        </CardContent>
      </Card>

      {/* Right Item */}
      <Card>
        <CardHeader>
          <CardTitle>{itemB.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <ExperienceDetails experience={itemB} />
        </CardContent>
      </Card>

      {/* Comparison Insights */}
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Analyse</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Similarity Score */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Ähnlichkeit</span>
                <span className="text-sm font-medium">{(comparison.score * 100).toFixed(0)}%</span>
              </div>
              <Progress value={comparison.score * 100} />
            </div>

            {/* Similarities */}
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                Gemeinsamkeiten
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {comparison.similarities.map((sim, i) => (
                  <li key={i}>{sim}</li>
                ))}
              </ul>
            </div>

            {/* Differences */}
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <X className="w-4 h-4 text-red-500" />
                Unterschiede
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {comparison.differences.map((diff, i) => (
                  <li key={i}>{diff}</li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

---

## 🎯 Smart Visualization Selection

### The Decision Engine

```typescript
export function selectVisualization(
  query: string,
  results: Experience[],
  context: ChatContext
): VisualizationType[] {
  const visualizations: VisualizationType[] = []

  // Always show data table/list (baseline)
  visualizations.push('list')

  // Check each visualization type
  if (shouldShowMap(query, results)) {
    visualizations.push('map')
  }

  if (shouldShowTimeline(query, results)) {
    visualizations.push('timeline')
  }

  if (shouldShowDashboard(query, results)) {
    visualizations.push('dashboard')
  }

  if (shouldShowNetwork(query, results)) {
    visualizations.push('network')
  }

  if (shouldShowComparison(query, results)) {
    visualizations.push('comparison')
  }

  // Progressive disclosure: show most relevant first
  return prioritizeVisualizations(visualizations, query, results)
}

function prioritizeVisualizations(
  visualizations: VisualizationType[],
  query: string,
  results: Experience[]
): VisualizationType[] {
  // Scoring system
  const scores = visualizations.map(viz => ({
    viz,
    score: calculateRelevanceScore(viz, query, results)
  }))

  // Sort by score, return top 2-3
  return scores
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(s => s.viz)
}
```

---

## 📱 Responsive Design Rules

### Mobile-First Approach

```typescript
// On mobile: Show visualizations sequentially, not side-by-side
<div className="flex flex-col lg:flex-row gap-4">
  {visualizations.map(viz => (
    <VisualizationCard key={viz} type={viz} data={results} />
  ))}
</div>

// Mobile: Collapse by default, expand on tap
<Accordion type="single" collapsible defaultValue={visualizations[0]}>
  {visualizations.map(viz => (
    <AccordionItem key={viz} value={viz}>
      <AccordionTrigger>
        {getVisualizationTitle(viz)}
      </AccordionTrigger>
      <AccordionContent>
        <VisualizationComponent type={viz} data={results} />
      </AccordionContent>
    </AccordionItem>
  ))}
</Accordion>
```

---

## 🎨 Design Tokens

```css
/* Colors */
--viz-primary: #8884d8;
--viz-secondary: #82ca9d;
--viz-accent: #ffc658;
--viz-danger: #ff6b6b;
--viz-success: #51cf66;

/* Spacing */
--viz-gap: 1rem;
--viz-padding: 1.5rem;

/* Typography */
--viz-title: 1.125rem;
--viz-label: 0.875rem;
--viz-caption: 0.75rem;

/* Borders */
--viz-border-radius: 0.5rem;
--viz-border-color: hsl(var(--border));
```

---

**Nächstes Dokument:** 10-SMART-SUGGESTIONS.md (AI Prompt Engine)
