/**
 * XPShare AI - Export Results Tool
 *
 * Exports query results and analysis data in various formats (JSON, CSV).
 * Handles data transformation and formatting for download.
 */

import { tool } from 'ai'
import { z } from 'zod'

// ============================================================================
// Schema Definition
// ============================================================================

const exportResultsSchema = z.object({
  data: z.any().describe('Data to export (experiences, insights, predictions, etc.)'),
  format: z.enum(['json', 'csv']).default('json').describe('Export format'),
  filename: z.string().optional().describe('Custom filename (without extension)'),
  includeMetadata: z
    .boolean()
    .default(true)
    .describe('Include metadata (timestamp, query, etc.)'),
  fields: z
    .array(z.string())
    .optional()
    .describe('Specific fields to include (for CSV, defaults to all)'),
})

// ============================================================================
// Type Definitions
// ============================================================================

export interface ExportResult {
  format: 'json' | 'csv'
  filename: string
  content: string
  size: number
  recordCount: number
  downloadUrl?: string
}

// ============================================================================
// CSV Utilities
// ============================================================================

/**
 * Escape CSV field value
 */
function escapeCSV(value: any): string {
  if (value === null || value === undefined) return ''

  const str = String(value)

  // Escape quotes and wrap in quotes if contains special chars
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }

  return str
}

/**
 * Flatten nested object for CSV export
 */
function flattenObject(obj: any, prefix = ''): Record<string, any> {
  const flattened: Record<string, any> = {}

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key

    if (value === null || value === undefined) {
      flattened[newKey] = ''
    } else if (Array.isArray(value)) {
      // Convert arrays to JSON strings
      flattened[newKey] = JSON.stringify(value)
    } else if (typeof value === 'object' && !(value instanceof Date)) {
      // Recursively flatten nested objects
      Object.assign(flattened, flattenObject(value, newKey))
    } else {
      flattened[newKey] = value
    }
  }

  return flattened
}

/**
 * Convert array of objects to CSV string
 */
function arrayToCSV(data: any[], fields?: string[]): string {
  if (data.length === 0) return ''

  // Flatten all objects
  const flattened = data.map((item) => flattenObject(item))

  // Determine fields
  let headers: string[]
  if (fields && fields.length > 0) {
    headers = fields
  } else {
    // Collect all unique keys
    const allKeys = new Set<string>()
    flattened.forEach((item: any) => {
      Object.keys(item).forEach((key) => allKeys.add(key))
    })
    headers = Array.from(allKeys).sort()
  }

  // Build CSV
  const rows: string[] = []

  // Header row
  rows.push(headers.map((h) => escapeCSV(h)).join(','))

  // Data rows
  flattened.forEach((item: any) => {
    const values = headers.map((header) => escapeCSV(item[header]))
    rows.push(values.join(','))
  })

  return rows.join('\n')
}

// ============================================================================
// JSON Utilities
// ============================================================================

/**
 * Convert data to formatted JSON string
 */
function dataToJSON(data: any, includeMetadata: boolean): string {
  if (includeMetadata) {
    const exportData = {
      metadata: {
        exportedAt: new Date().toISOString(),
        recordCount: Array.isArray(data) ? data.length : 1,
        version: '1.0',
        source: 'XPShare AI Discovery',
      },
      data,
    }
    return JSON.stringify(exportData, null, 2)
  }

  return JSON.stringify(data, null, 2)
}

// ============================================================================
// Export Functions
// ============================================================================

/**
 * Generate filename with timestamp
 */
function generateFilename(customFilename?: string, format: 'json' | 'csv' = 'json'): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19)

  if (customFilename) {
    return `${customFilename}-${timestamp}.${format}`
  }

  return `xpshare-export-${timestamp}.${format}`
}

/**
 * Export data in specified format
 */
function exportData(
  data: any,
  format: 'json' | 'csv',
  filename?: string,
  includeMetadata: boolean = true,
  fields?: string[]
): ExportResult {
  // Normalize data to array
  let dataArray: any[]
  if (Array.isArray(data)) {
    dataArray = data
  } else if (data?.results && Array.isArray(data.results)) {
    dataArray = data.results
  } else if (data?.data && Array.isArray(data.data)) {
    dataArray = data.data
  } else {
    dataArray = [data]
  }

  // Generate content
  let content: string
  if (format === 'csv') {
    content = arrayToCSV(dataArray, fields)
  } else {
    content = dataToJSON(dataArray, includeMetadata)
  }

  // Generate filename
  const finalFilename = generateFilename(filename, format)

  // Calculate size
  const size = new Blob([content]).size

  return {
    format,
    filename: finalFilename,
    content,
    size,
    recordCount: dataArray.length,
  }
}

// ============================================================================
// Main Tool
// ============================================================================

export const exportResultsTool = tool({
  description: `Export query results and analysis data in JSON or CSV format.

  Features:
  - JSON export with optional metadata
  - CSV export with automatic flattening of nested objects
  - Custom filename support
  - Field selection for CSV exports
  - Automatic timestamp generation
  - Data normalization (handles arrays, objects, wrappers)

  Returns export content as string with metadata.`,
  inputSchema: exportResultsSchema,
  execute: async ({ data, format, filename, includeMetadata, fields }) => {
    try {
      const exportResult = exportData(data, format, filename, includeMetadata, fields)

      return {
        success: true,
        export: exportResult,
        summary: `Exported ${exportResult.recordCount} records as ${format.toUpperCase()} (${(exportResult.size / 1024).toFixed(2)} KB)`,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Export failed',
        export: null,
      }
    }
  },
})
