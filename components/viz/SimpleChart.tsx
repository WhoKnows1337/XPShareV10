/**
 * XPShare AI - Simple Chart Visualization
 *
 * Generic chart component for rankings, distributions, and simple data.
 * Supports bar and pie charts.
 */

'use client'

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

// ============================================================================
// Type Definitions
// ============================================================================

export interface SimpleChartProps {
  /** Chart data */
  data: Array<{
    label: string
    value: number
    [key: string]: any
  }>

  /** Chart title */
  title?: string

  /** Chart type */
  type?: 'bar' | 'pie'

  /** Height in pixels */
  height?: number

  /** Color theme */
  theme?: 'light' | 'dark'

  /** Value label (e.g., "Count", "Score") */
  valueLabel?: string
}

// ============================================================================
// Chart Colors
// ============================================================================

const CHART_COLORS = [
  '#8b5cf6', // purple
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ec4899', // pink
  '#6366f1', // indigo
  '#ef4444', // red
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f97316', // orange
]

// ============================================================================
// Simple Chart Component
// ============================================================================

export function SimpleChart({
  data,
  title,
  type = 'bar',
  height = 400,
  theme = 'light',
  valueLabel = 'Value',
}: SimpleChartProps) {
  // Theme colors
  const colors = {
    background: theme === 'dark' ? '#1f2937' : '#ffffff',
    text: theme === 'dark' ? '#f3f4f6' : '#111827',
    grid: theme === 'dark' ? '#374151' : '#e5e7eb',
    tooltip: theme === 'dark' ? '#374151' : '#ffffff',
  }

  if (type === 'pie') {
    return (
      <div className="w-full">
        {title && (
          <h3 className="text-lg font-semibold mb-4" style={{ color: colors.text }}>
            {title}
          </h3>
        )}

        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              outerRadius={120}
              label={(entry) => `${entry.label}: ${entry.value}`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>

            <Tooltip
              contentStyle={{
                backgroundColor: colors.tooltip,
                border: `1px solid ${colors.grid}`,
                borderRadius: '8px',
              }}
            />

            <Legend wrapperStyle={{ color: colors.text }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    )
  }

  // Bar chart
  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold mb-4" style={{ color: colors.text }}>
          {title}
        </h3>
      )}

      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />

          <XAxis
            dataKey="label"
            stroke={colors.text}
            tick={{ fill: colors.text }}
            angle={-45}
            textAnchor="end"
            height={100}
          />

          <YAxis stroke={colors.text} tick={{ fill: colors.text }} label={{ value: valueLabel, angle: -90, position: 'insideLeft' }} />

          <Tooltip
            contentStyle={{
              backgroundColor: colors.tooltip,
              border: `1px solid ${colors.grid}`,
              borderRadius: '8px',
            }}
            labelStyle={{ color: colors.text }}
          />

          <Legend wrapperStyle={{ color: colors.text }} />

          <Bar dataKey="value" fill={CHART_COLORS[0]} name={valueLabel} />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-2 text-sm text-gray-500">
        {data.length} items | Total: {data.reduce((sum, d) => sum + d.value, 0)}
      </div>
    </div>
  )
}
