'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Download, FileText, FileSpreadsheet, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'

interface DownloadReportButtonProps {
  userId: string
  userName: string
}

export function DownloadReportButton({ userId, userName }: DownloadReportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const generatePDFReport = async () => {
    setIsGenerating(true)

    try {
      const supabase = createClient()

      // Fetch user data
      const { data: userData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      // Fetch experiences
      const { data: experiences } = await supabase
        .from('experiences')
        .select('*')
        .eq('user_id', userId)

      // Fetch impact data
      const { data: impact } = await (supabase as any).rpc('calculate_user_impact', {
        p_user_id: userId,
      })

      // Generate PDF (simplified - in production use a PDF library like jsPDF)
      const reportData = {
        user: userData,
        experiences,
        impact,
        generatedAt: new Date().toISOString(),
      }

      // Create blob and download
      const blob = new Blob([JSON.stringify(reportData, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `xp-share-report-${userName}-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: 'Report Generated!',
        description: 'Your profile report has been downloaded.',
      })
    } catch (error) {
      console.error('Error generating report:', error)
      toast({
        title: 'Error',
        description: 'Failed to generate report. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const generateCSVReport = async () => {
    setIsGenerating(true)

    try {
      const supabase = createClient()

      // Fetch experiences
      const { data: experiences } = await supabase
        .from('experiences')
        .select('*')
        .eq('user_id', userId)

      if (!experiences) throw new Error('No experiences found')

      // Convert to CSV
      const headers = ['Title', 'Category', 'Date', 'Location', 'Views', 'Upvotes', 'Comments']
      const rows = experiences.map((exp) => [
        exp.title,
        exp.category,
        exp.date_occurred || exp.created_at,
        exp.location_text || 'N/A',
        exp.view_count || 0,
        exp.upvote_count || 0,
        exp.comment_count || 0,
      ])

      const csvContent =
        headers.join(',') +
        '\n' +
        rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `xp-share-experiences-${userName}-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: 'CSV Downloaded!',
        description: 'Your experiences have been exported to CSV.',
      })
    } catch (error) {
      console.error('Error generating CSV:', error)
      toast({
        title: 'Error',
        description: 'Failed to generate CSV. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isGenerating} className="gap-2">
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Download Report
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={generatePDFReport}>
          <FileText className="h-4 w-4 mr-2" />
          Download as JSON (Full Report)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={generateCSVReport}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Download as CSV (Experiences Only)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
