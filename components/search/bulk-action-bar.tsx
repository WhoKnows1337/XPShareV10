'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  X,
  Download,
  Share2,
  GitCompare,
  Plus,
  MoreHorizontal,
  FileJson,
  FileSpreadsheet,
  Printer,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface BulkActionBarProps {
  selectedCount: number
  onClearSelection: () => void
  onCompare: () => void
  onExportJSON: () => void
  onExportCSV: () => void
  onShare: () => void
  onAddToCollection?: () => void
  onPrint?: () => void
  className?: string
}

export function BulkActionBar({
  selectedCount,
  onClearSelection,
  onCompare,
  onExportJSON,
  onExportCSV,
  onShare,
  onAddToCollection,
  onPrint,
  className,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null

  return (
    <div
      className={cn(
        'fixed bottom-6 left-1/2 -translate-x-1/2 z-50',
        'bg-background border shadow-lg rounded-full px-6 py-3',
        'flex items-center gap-4',
        'animate-in slide-in-from-bottom-5 duration-300',
        className
      )}
    >
      {/* Selection Count */}
      <div className="flex items-center gap-2">
        <Badge variant="default" className="rounded-full h-8 w-8 flex items-center justify-center p-0">
          {selectedCount}
        </Badge>
        <span className="text-sm font-medium">
          {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
        </span>
      </div>

      <div className="h-6 w-px bg-border" />

      {/* Primary Actions */}
      <div className="flex items-center gap-2">
        {selectedCount >= 2 && selectedCount <= 5 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCompare}
            className="rounded-full"
          >
            <GitCompare className="w-4 h-4 mr-2" />
            Compare
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={onShare}
          className="rounded-full"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>

        {/* Export Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="rounded-full">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Export Format</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onExportJSON}>
              <FileJson className="w-4 h-4 mr-2" />
              Export as JSON
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExportCSV}>
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Export as CSV
            </DropdownMenuItem>
            {onPrint && (
              <DropdownMenuItem onClick={onPrint}>
                <Printer className="w-4 h-4 mr-2" />
                Print
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* More Actions */}
        {onAddToCollection && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onAddToCollection}>
                <Plus className="w-4 h-4 mr-2" />
                Add to Collection
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="h-6 w-px bg-border" />

      {/* Clear Selection */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onClearSelection}
        className="rounded-full h-9 w-9"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  )
}
