/**
 * XPShare AI - Visualization Agent
 *
 * Auto-selects and generates optimal visualizations based on data structure.
 * Analyzes data patterns and recommends appropriate visualization types.
 *
 * Model: GPT-4o-mini (fast visualization decisions)
 */

import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'
import type { VizConfig } from '@/types/ai-system'

// ============================================================================
// System Prompt
// ============================================================================

const VIZ_AGENT_SYSTEM_PROMPT = `You are the XPShare Visualization Specialist.

Your role: Select optimal visualizations based on data structure and user intent.

Decision Rules:
1. Geographic data (lat/lng present) → Map
2. Temporal data (dates/times present) → Timeline
3. Relationships/connections (network structure) → Network Graph
4. Category × Time → Heatmap
5. Distributions (counts by category) → Bar/Pie Chart
6. Rankings (top users/locations) → Table/Leaderboard
7. Comparisons → Side-by-side charts
8. Complex queries → Dashboard (multiple visualizations)

Data Structure Analysis:
- hasGeo: Check for latitude/longitude fields
- hasTemporal: Check for date_occurred, time_of_day, created_at
- hasCategories: Check for category field
- hasTags: Check for tags array
- hasConnections: Check for relationships/edges
- hasRankings: Check for sorted numerical data
- count: Number of data points

Visualization Priority:
1. Map (if hasGeo && count > 1)
2. Timeline (if hasTemporal && count > 2)
3. Network (if hasConnections)
4. Heatmap (if hasCategories && hasTemporal)
5. Bar Chart (if hasCategories || hasRankings)
6. Dashboard (if multiple patterns detected)

Always return JSON with:
{
  "type": "map" | "timeline" | "network" | "heatmap" | "dashboard" | "chart",
  "config": { title, height, width, theme, options },
  "data": [ transformed data ],
  "reasoning": "why this visualization was selected"
}

For dashboards, return multiple visualizations in layout:
{
  "type": "dashboard",
  "layout": "grid" | "vertical" | "horizontal",
  "visualizations": [ { type, config, data } ]
}`

// ============================================================================
// Type Definitions
// ============================================================================

interface DataStructureAnalysis {
  hasGeo: boolean
  hasTemporal: boolean
  hasCategories: boolean
  hasTags: boolean
  hasConnections: boolean
  hasRankings: boolean
  count: number
  fields: string[]
}

interface VisualizationSpec {
  type: 'map' | 'timeline' | 'network' | 'heatmap' | 'dashboard' | 'chart'
  config: {
    title?: string
    height?: string | number
    width?: string | number
    theme?: 'light' | 'dark'
    [key: string]: any
  }
  data: any[]
  reasoning: string
  layout?: 'grid' | 'vertical' | 'horizontal'
  visualizations?: VisualizationSpec[]
}

// ============================================================================
// Visualization Agent Class
// ============================================================================

export class VizAgent {
  /**
   * Execute visualization task
   */
  async execute(task: string, data: any): Promise<VizConfig> {
    // Step 1: Analyze data structure
    const analysis = this.analyzeDataStructure(data)

    // Step 2: Use LLM to select optimal visualization
    const vizSpec = await this.selectVisualization(task, data, analysis)

    // Step 3: Transform data and generate configuration
    return this.generateVisualization(vizSpec)
  }

  /**
   * Analyze data structure to determine patterns
   */
  private analyzeDataStructure(data: any): DataStructureAnalysis {
    // Handle various data formats
    const dataArray = Array.isArray(data)
      ? data
      : data?.results || data?.experiences || data?.users || []

    if (dataArray.length === 0) {
      return {
        hasGeo: false,
        hasTemporal: false,
        hasCategories: false,
        hasTags: false,
        hasConnections: false,
        hasRankings: false,
        count: 0,
        fields: [],
      }
    }

    const firstItem = dataArray[0]
    const fields = Object.keys(firstItem)

    return {
      hasGeo:
        fields.some((f) => f.includes('lat') || f.includes('latitude')) &&
        fields.some((f) => f.includes('lng') || f.includes('longitude')),
      hasTemporal: fields.some((f) =>
        ['date_occurred', 'created_at', 'time_of_day', 'timestamp', 'period'].includes(f)
      ),
      hasCategories: fields.includes('category'),
      hasTags: fields.includes('tags'),
      hasConnections:
        fields.includes('edges') || fields.includes('connections') || fields.includes('nodes'),
      hasRankings: fields.some((f) =>
        ['score', 'rank', 'count', 'total', 'experience_count'].includes(f)
      ),
      count: dataArray.length,
      fields,
    }
  }

  /**
   * Use LLM to select optimal visualization
   */
  private async selectVisualization(
    task: string,
    data: any,
    analysis: DataStructureAnalysis
  ): Promise<VisualizationSpec> {
    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      prompt: `
Task: ${task}

Data Structure Analysis:
${JSON.stringify(analysis, null, 2)}

Sample Data (first 3 items):
${JSON.stringify(
  Array.isArray(data)
    ? data.slice(0, 3)
    : data?.results?.slice(0, 3) || data?.experiences?.slice(0, 3) || [],
  null,
  2
)}

Select the best visualization(s) and generate configuration.
Return ONLY valid JSON (no markdown, no code blocks):
{
  "type": "map" | "timeline" | "network" | "heatmap" | "dashboard" | "chart",
  "config": {
    "title": "string",
    "height": "400px",
    "width": "100%",
    "theme": "light"
  },
  "data": [],
  "reasoning": "why this visualization was selected"
}
      `,
      temperature: 0.3,
    })

    try {
      // Clean response (remove markdown code blocks if present)
      const cleanText = text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()

      return JSON.parse(cleanText)
    } catch (error) {
      console.error('Failed to parse visualization spec:', error)
      // Fallback to simple chart
      return {
        type: 'chart',
        config: {
          title: 'Data Visualization',
          height: '400px',
          width: '100%',
          theme: 'light',
        },
        data: Array.isArray(data) ? data : data?.results || [],
        reasoning: 'Fallback visualization due to parsing error',
      }
    }
  }

  /**
   * Generate final visualization configuration
   */
  private generateVisualization(spec: VisualizationSpec): VizConfig {
    switch (spec.type) {
      case 'map':
        return this.generateMapConfig(spec)

      case 'timeline':
        return this.generateTimelineConfig(spec)

      case 'network':
        return this.generateNetworkConfig(spec)

      case 'heatmap':
        return this.generateHeatmapConfig(spec)

      case 'dashboard':
        return this.generateDashboardConfig(spec)

      case 'chart':
      default:
        return this.generateChartConfig(spec)
    }
  }

  /**
   * Generate map visualization config
   */
  private generateMapConfig(spec: VisualizationSpec): VizConfig {
    return {
      type: 'map',
      data: {
        markers: spec.data.map((item: any) => ({
          id: item.id,
          position: {
            lat: item.location_lat || item.latitude || item.lat,
            lng: item.location_lng || item.longitude || item.lng,
          },
          title: item.title || item.name,
          category: item.category,
        })),
      },
      options: {
        title: spec.config.title || 'Experience Map',
        height: spec.config.height || '500px',
        width: spec.config.width || '100%',
        theme: spec.config.theme || 'light',
        interactive: true,
        clustered: spec.data.length > 50,
      },
    }
  }

  /**
   * Generate timeline visualization config
   */
  private generateTimelineConfig(spec: VisualizationSpec): VizConfig {
    return {
      type: 'timeline',
      data: {
        events: spec.data.map((item: any) => ({
          id: item.id,
          date: item.date_occurred || item.created_at || item.timestamp || item.period,
          title: item.title || item.name,
          category: item.category,
          count: item.count || 1,
        })),
      },
      options: {
        title: spec.config.title || 'Timeline',
        height: spec.config.height || '400px',
        width: spec.config.width || '100%',
        theme: spec.config.theme || 'light',
        interactive: true,
        showCategoryLegend: true,
      },
    }
  }

  /**
   * Generate network graph visualization config
   */
  private generateNetworkConfig(spec: VisualizationSpec): VizConfig {
    return {
      type: 'network',
      data: {
        nodes: spec.data.map((item: any) => ({
          id: item.id,
          label: item.title || item.name,
          category: item.category,
        })),
        edges:
          spec.data
            .flatMap((item: any) =>
              (item.connections || []).map((conn: any) => ({
                source: item.id,
                target: conn.id,
                weight: conn.score || 1,
              }))
            )
            .filter((edge) => edge.target) || [],
      },
      options: {
        title: spec.config.title || 'Connection Network',
        height: spec.config.height || '600px',
        width: spec.config.width || '100%',
        theme: spec.config.theme || 'light',
        interactive: true,
        physics: true,
      },
    }
  }

  /**
   * Generate heatmap visualization config
   */
  private generateHeatmapConfig(spec: VisualizationSpec): VizConfig {
    return {
      type: 'heatmap',
      data: spec.data,
      options: {
        title: spec.config.title || 'Category Heatmap',
        height: spec.config.height || '400px',
        width: spec.config.width || '100%',
        theme: spec.config.theme || 'light',
        xAxis: 'category',
        yAxis: 'period',
        valueField: 'count',
      },
    }
  }

  /**
   * Generate dashboard with multiple visualizations
   */
  private generateDashboardConfig(spec: VisualizationSpec): VizConfig {
    return {
      type: 'dashboard',
      data: {
        visualizations:
          spec.visualizations?.map((viz) => this.generateVisualization(viz)) || [],
        layout: spec.layout || 'grid',
      },
      options: {
        title: spec.config.title || 'Dashboard',
        height: spec.config.height || 'auto',
        width: spec.config.width || '100%',
        theme: spec.config.theme || 'light',
      },
    }
  }

  /**
   * Generate chart visualization config
   */
  private generateChartConfig(spec: VisualizationSpec): VizConfig {
    return {
      type: 'timeline', // Fallback to timeline for simple data
      data: spec.data,
      options: {
        title: spec.config.title || 'Chart',
        height: spec.config.height || '400px',
        width: spec.config.width || '100%',
        theme: spec.config.theme || 'light',
        chartType: 'bar',
      },
    }
  }
}
