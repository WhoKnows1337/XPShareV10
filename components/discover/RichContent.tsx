/**
 * Rich Content Rendering
 *
 * Enhanced rendering for code blocks, tables, and formatted content.
 * Integrates with markdown renderer for better UX.
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Copy, Check, Download } from 'lucide-react'
import { toast } from 'sonner'

export interface CodeBlockProps {
  code: string
  language?: string
  filename?: string
  showLineNumbers?: boolean
}

/**
 * Code Block with syntax highlighting and copy button
 */
export function CodeBlock({
  code,
  language = 'text',
  filename,
  showLineNumbers = false,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      toast.success('Code copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy code')
    }
  }

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename || `code.${language}`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Code downloaded')
  }

  const lines = code.split('\n')

  return (
    <div className="rounded-lg border bg-muted/50 overflow-hidden my-2">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted border-b">
        <div className="flex items-center gap-2">
          {filename && <span className="text-sm font-medium">{filename}</span>}
          {language && (
            <Badge variant="outline" className="text-xs">
              {language}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2"
            onClick={handleCopy}
            aria-label="Copy code"
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            <span className="ml-1 text-xs">{copied ? 'Copied' : 'Copy'}</span>
          </Button>
          {filename && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              onClick={handleDownload}
              aria-label="Download code"
            >
              <Download className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Code Content */}
      <div className="overflow-x-auto">
        <pre className="p-4 text-sm">
          <code className={`language-${language}`}>
            {showLineNumbers ? (
              <table className="w-full border-separate border-spacing-0">
                <tbody>
                  {lines.map((line, index) => (
                    <tr key={index}>
                      <td className="pr-4 text-right text-muted-foreground select-none w-8">
                        {index + 1}
                      </td>
                      <td className="whitespace-pre">{line}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              code
            )}
          </code>
        </pre>
      </div>
    </div>
  )
}

/**
 * Data Table with sorting and filtering
 */
export interface TableData {
  headers: string[]
  rows: (string | number)[][]
}

export function DataTable({ headers, rows }: TableData) {
  const [sortColumn, setSortColumn] = useState<number | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const handleSort = (columnIndex: number) => {
    if (sortColumn === columnIndex) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(columnIndex)
      setSortDirection('asc')
    }
  }

  const sortedRows = sortColumn !== null
    ? [...rows].sort((a, b) => {
        const aVal = a[sortColumn]
        const bVal = b[sortColumn]

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
        }

        const aStr = String(aVal)
        const bStr = String(bVal)
        return sortDirection === 'asc'
          ? aStr.localeCompare(bStr)
          : bStr.localeCompare(aStr)
      })
    : rows

  const handleExport = () => {
    // Convert to CSV
    const csv = [
      headers.join(','),
      ...sortedRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'table.csv'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Table exported as CSV')
  }

  return (
    <div className="rounded-lg border bg-card overflow-hidden my-2">
      {/* Header with export */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted border-b">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {rows.length} row{rows.length !== 1 ? 's' : ''}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2"
          onClick={handleExport}
          aria-label="Export as CSV"
        >
          <Download className="h-3 w-3" />
          <span className="ml-1 text-xs">Export CSV</span>
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b">
            <tr>
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="px-4 py-2 text-left text-sm font-medium cursor-pointer hover:bg-muted/70 transition-colors"
                  onClick={() => handleSort(index)}
                >
                  <div className="flex items-center gap-2">
                    {header}
                    {sortColumn === index && (
                      <span className="text-xs text-muted-foreground">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b last:border-b-0 hover:bg-muted/30 transition-colors"
              >
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-4 py-2 text-sm">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/**
 * Collapsible JSON Viewer
 */
export function JsonViewer({ data }: { data: any }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  const jsonString = JSON.stringify(data, null, 2)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString)
      setCopied(true)
      toast.success('JSON copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy JSON')
    }
  }

  return (
    <div className="rounded-lg border bg-muted/50 overflow-hidden my-2">
      <div className="flex items-center justify-between px-4 py-2 bg-muted border-b">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            JSON
          </Badge>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2"
          onClick={handleCopy}
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        </Button>
      </div>

      {isExpanded && (
        <div className="overflow-x-auto">
          <pre className="p-4 text-xs">
            <code>{jsonString}</code>
          </pre>
        </div>
      )}
    </div>
  )
}

/**
 * Mermaid Diagram Renderer (placeholder for future enhancement)
 */
export function MermaidDiagram({ code }: { code: string }) {
  return (
    <div className="rounded-lg border bg-muted/50 p-4 my-2">
      <p className="text-sm text-muted-foreground">
        Mermaid diagram rendering coming soon...
      </p>
      <pre className="mt-2 text-xs overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  )
}
