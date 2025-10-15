'use client'

import { HelpCircle, Sparkles, FileText, TrendingUp } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

interface ResultExplanationTooltipProps {
  experience: any
  searchMode?: 'hybrid' | 'nlp' | 'ask'
}

export function ResultExplanationTooltip({
  experience,
  searchMode = 'hybrid'
}: ResultExplanationTooltipProps) {
  // Extract scores from experience (if available from hybrid search)
  const vectorScore = experience.similarity || experience.vector_score || 0
  const textScore = experience.text_rank || experience.fts_score || 0
  const combinedScore = experience.combined_score || (vectorScore + textScore) / 2

  // Determine relevance level
  const getRelevanceLevel = (score: number): { label: string; color: string } => {
    if (score >= 0.8) return { label: 'Highly Relevant', color: 'text-green-600' }
    if (score >= 0.6) return { label: 'Relevant', color: 'text-blue-600' }
    if (score >= 0.4) return { label: 'Moderately Relevant', color: 'text-yellow-600' }
    return { label: 'Low Relevance', color: 'text-gray-600' }
  }

  const relevance = getRelevanceLevel(combinedScore)

  // Matching reasons
  const matchingReasons: string[] = []
  if (vectorScore > 0.5) matchingReasons.push('Semantic similarity')
  if (textScore > 0.5) matchingReasons.push('Keyword match')
  if (experience.matchedLanguage) matchingReasons.push(`Found in ${experience.matchedLanguage}`)
  if (experience.category) matchingReasons.push(`Category: ${experience.category}`)

  return (
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Why this result?</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" className="w-80 p-4" align="start">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">Relevance Explanation</h4>
              <Badge variant={combinedScore >= 0.6 ? 'default' : 'secondary'} className="text-xs">
                {Math.round(combinedScore * 100)}% match
              </Badge>
            </div>

            {/* Overall Relevance */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium">Overall Relevance</span>
                <span className={`text-xs font-semibold ${relevance.color}`}>
                  {relevance.label}
                </span>
              </div>
              <Progress value={combinedScore * 100} className="h-2" />
            </div>

            {/* Score Breakdown for Hybrid Search */}
            {searchMode === 'hybrid' && (vectorScore > 0 || textScore > 0) && (
              <div className="space-y-2">
                <p className="text-xs font-medium">Score Breakdown:</p>

                {/* Vector Score */}
                {vectorScore > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-purple-500" />
                        Semantic Similarity
                      </span>
                      <span className="text-xs font-medium">
                        {Math.round(vectorScore * 100)}%
                      </span>
                    </div>
                    <Progress value={vectorScore * 100} className="h-1.5" />
                  </div>
                )}

                {/* Text Score */}
                {textScore > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <FileText className="w-3 h-3 text-blue-500" />
                        Keyword Match
                      </span>
                      <span className="text-xs font-medium">
                        {Math.round(textScore * 100)}%
                      </span>
                    </div>
                    <Progress value={textScore * 100} className="h-1.5" />
                  </div>
                )}
              </div>
            )}

            {/* Matching Reasons */}
            {matchingReasons.length > 0 && (
              <div>
                <p className="text-xs font-medium mb-2">Why this matches:</p>
                <ul className="space-y-1">
                  {matchingReasons.map((reason, index) => (
                    <li key={index} className="text-xs text-muted-foreground flex items-center gap-2">
                      <TrendingUp className="w-3 h-3 flex-shrink-0" />
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Additional Context */}
            <div className="pt-2 border-t text-xs text-muted-foreground">
              <p>
                <strong>Tip:</strong> Adjust search settings to refine results. Higher semantic
                weight finds conceptually similar content, while higher keyword weight finds exact matches.
              </p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
