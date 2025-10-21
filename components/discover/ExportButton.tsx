/**
 * XPShare AI - Export Button Component
 *
 * Provides download functionality for query results in JSON/CSV formats.
 * Integrates with export-results tool for data transformation.
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Download, FileJson, FileSpreadsheet, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// ============================================================================
// Props
// ============================================================================

export interface ExportButtonProps {
  data: any
  filename?: string
  includeMetadata?: boolean
  fields?: string[]
  onExportStart?: () => void
  onExportComplete?: (format: 'json' | 'csv', size: number) => void
  onExportError?: (error: Error) => void
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  showLabel?: boolean
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Trigger browser download of content
 */
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

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
 * Escape CSV field value
 */
function escapeCSV(value: any): string {
  if (value === null || value === undefined) return ''

  const str = String(value)

  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }

  return str
}

/**
 * Flatten nested object for CSV
 */
function flattenObject(obj: any, prefix = ''): Record<string, any> {
  const flattened: Record<string, any> = {}

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key

    if (value === null || value === undefined) {
      flattened[newKey] = ''
    } else if (Array.isArray(value)) {
      flattened[newKey] = JSON.stringify(value)
    } else if (typeof value === 'object' && !(value instanceof Date)) {
      Object.assign(flattened, flattenObject(value, newKey))
    } else {
      flattened[newKey] = value
    }
  }

  return flattened
}

/**
 * Convert array to CSV string
 */
function arrayToCSV(data: any[], fields?: string[]): string {
  if (data.length === 0) return ''

  const flattened = data.map((item) => flattenObject(item))

  let headers: string[]
  if (fields && fields.length > 0) {
    headers = fields
  } else {
    const allKeys = new Set<string>()
    flattened.forEach((item) => {
      Object.keys(item).forEach((key) => allKeys.add(key))
    })
    headers = Array.from(allKeys).sort()
  }

  const rows: string[] = []
  rows.push(headers.map((h) => escapeCSV(h)).join(','))

  flattened.forEach((item) => {
    const values = headers.map((header) => escapeCSV(item[header]))
    rows.push(values.join(','))
  })

  return rows.join('\n')
}

/**
 * Convert data to JSON string
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
// Component
// ============================================================================

export function ExportButton({
  data,
  filename,
  includeMetadata = true,
  fields,
  onExportStart,
  onExportComplete,
  onExportError,
  className,
  variant = 'outline',
  size = 'default',
  showLabel = true,
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      setIsExporting(true)
      onExportStart?.()

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
      let mimeType: string

      if (format === 'csv') {
        content = arrayToCSV(dataArray, fields)
        mimeType = 'text/csv;charset=utf-8;'
      } else {
        content = dataToJSON(dataArray, includeMetadata)
        mimeType = 'application/json;charset=utf-8;'
      }

      // Generate filename
      const finalFilename = generateFilename(filename, format)

      // Trigger download
      downloadFile(content, finalFilename, mimeType)

      // Calculate size
      const size = new Blob([content]).size

      onExportComplete?.(format, size)
    } catch (error) {
      console.error('Export failed:', error)
      onExportError?.(error instanceof Error ? error : new Error('Export failed'))
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={className} disabled={isExporting}>
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {showLabel && size !== 'icon' && (
            <span className="ml-2">{isExporting ? 'Exporting...' : 'Export'}</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Export Format</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleExport('json')} className="cursor-pointer">
          <FileJson className="mr-2 h-4 w-4" />
          <span>JSON</span>
          <span className="ml-auto text-xs text-gray-500">Structured</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('csv')} className="cursor-pointer">
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          <span>CSV</span>
          <span className="ml-auto text-xs text-gray-500">Spreadsheet</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
