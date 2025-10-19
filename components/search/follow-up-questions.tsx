'use client'

/**
 * Search 5.0 - Follow-Up Questions
 *
 * Displays context-aware follow-up question suggestions to
 * encourage deeper exploration and multi-turn conversation.
 *
 * @see docs/masterdocs/search5.md (Part 4.3 - Follow-Up Suggestions)
 */

import React from 'react'
import {
  MessageSquarePlus,
  TrendingUp,
  Calendar,
  MapPin,
  Zap,
  ChevronRight
} from 'lucide-react'
import { Pattern } from '@/types/search5'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

// ============================================================================
// TYPES
// ============================================================================

interface FollowUpQuestionsProps {
  /**
   * Current patterns (for context-aware suggestions)
   */
  patterns?: Pattern[]

  /**
   * Primary category (for category-specific questions)
   */
  primaryCategory?: string

  /**
   * Callback when user clicks a follow-up question
   */
  onQuestionClick: (question: string) => void

  /**
   * Maximum number of suggestions to show
   */
  maxSuggestions?: number

  /**
   * Compact mode
   */
  compact?: boolean

  /**
   * Additional className
   */
  className?: string
}

interface FollowUpSuggestion {
  question: string
  icon?: React.ReactNode
  rationale?: string
  targetPattern?: string
}

// ============================================================================
// CATEGORY-SPECIFIC FOLLOW-UPS
// ============================================================================

const CATEGORY_FOLLOW_UPS: Record<string, FollowUpSuggestion[]> = {
  ufo: [
    {
      question: 'Welche Formen werden am häufigsten beschrieben?',
      icon: <TrendingUp className="h-4 w-4" />,
      rationale: 'Erkunde morphologische Muster'
    },
    {
      question: 'Gibt es Berichte mit mehreren Zeugen?',
      icon: <MessageSquarePlus className="h-4 w-4" />,
      rationale: 'Untersuche Glaubwürdigkeit'
    },
    {
      question: 'Zu welcher Tageszeit treten die meisten Sichtungen auf?',
      icon: <Calendar className="h-4 w-4" />,
      rationale: 'Finde zeitliche Korrelationen'
    },
    {
      question: 'Welche geografischen Cluster sind erkennbar?',
      icon: <MapPin className="h-4 w-4" />,
      rationale: 'Entdecke Hotspots'
    }
  ],
  nde: [
    {
      question: 'Welche gemeinsamen Elemente gibt es in Nahtoderfahrungen?',
      icon: <TrendingUp className="h-4 w-4" />,
      rationale: 'Identifiziere universelle Muster'
    },
    {
      question: 'Wie beschreiben Menschen das Zeitgefühl?',
      icon: <Calendar className="h-4 w-4" />,
      rationale: 'Verstehe Zeit-Wahrnehmung'
    },
    {
      question: 'Welche Emotionen werden am häufigsten berichtet?',
      icon: <Zap className="h-4 w-4" />,
      rationale: 'Analysiere emotionale Muster'
    }
  ],
  psychedelics: [
    {
      question: 'Welche Substanzen wurden verwendet?',
      icon: <TrendingUp className="h-4 w-4" />,
      rationale: 'Kategorisiere nach Substanz'
    },
    {
      question: 'Wie lange dauerten die Erfahrungen?',
      icon: <Calendar className="h-4 w-4" />,
      rationale: 'Vergleiche Dauer-Muster'
    },
    {
      question: 'Welche Muster gibt es in den visuellen Erfahrungen?',
      icon: <Zap className="h-4 w-4" />,
      rationale: 'Erkunde visuelle Halluzinationen'
    }
  ],
  'lucid-dream': [
    {
      question: 'Welche Techniken wurden für luzides Träumen verwendet?',
      icon: <TrendingUp className="h-4 w-4" />,
      rationale: 'Sammle Induktions-Methoden'
    },
    {
      question: 'Wie lange dauert es, bis Kontrolle erlangt wird?',
      icon: <Calendar className="h-4 w-4" />,
      rationale: 'Verstehe Lernkurve'
    },
    {
      question: 'Welche Aktivitäten werden im luziden Traum ausgeführt?',
      icon: <Zap className="h-4 w-4" />,
      rationale: 'Entdecke häufige Handlungen'
    }
  ],
  meditation: [
    {
      question: 'Welche Meditationstechniken wurden praktiziert?',
      icon: <TrendingUp className="h-4 w-4" />,
      rationale: 'Vergleiche Methoden'
    },
    {
      question: 'Wie lange wurde meditiert?',
      icon: <Calendar className="h-4 w-4" />,
      rationale: 'Korreliere Dauer mit Tiefe'
    },
    {
      question: 'Welche körperlichen Empfindungen wurden berichtet?',
      icon: <Zap className="h-4 w-4" />,
      rationale: 'Analysiere somatische Effekte'
    }
  ]
}

// ============================================================================
// PATTERN-SPECIFIC FOLLOW-UPS
// ============================================================================

const PATTERN_TYPE_FOLLOW_UPS: Record<string, FollowUpSuggestion[]> = {
  color: [
    {
      question: 'Gibt es auch andere Farbmuster in anderen Kategorien?',
      targetPattern: 'color',
      rationale: 'Cross-Category Vergleich'
    },
    {
      question: 'Korrelieren die Farben mit bestimmten Verhaltensweisen?',
      targetPattern: 'behavior',
      rationale: 'Finde Farb-Verhaltens-Korrelation'
    }
  ],
  temporal: [
    {
      question: 'Gibt es saisonale Muster über mehrere Jahre?',
      targetPattern: 'temporal',
      rationale: 'Längerfristige Trends'
    },
    {
      question: 'Korrelieren zeitliche Muster mit Orten?',
      targetPattern: 'location',
      rationale: 'Zeit-Ort-Korrelation'
    }
  ],
  behavior: [
    {
      question: 'Welche Verhaltensweisen treten gemeinsam auf?',
      targetPattern: 'behavior',
      rationale: 'Verhaltens-Cluster'
    },
    {
      question: 'Gibt es Unterschiede in verschiedenen Regionen?',
      targetPattern: 'location',
      rationale: 'Regional-Verhaltens-Unterschiede'
    }
  ],
  location: [
    {
      question: 'Was ist besonders an diesen Orten?',
      targetPattern: 'attribute',
      rationale: 'Orts-Eigenschaften'
    },
    {
      question: 'Gibt es zeitliche Muster an diesen Orten?',
      targetPattern: 'temporal',
      rationale: 'Ort-Zeit-Korrelation'
    }
  ],
  attribute: [
    {
      question: 'Welche Attribute korrelieren miteinander?',
      targetPattern: 'attribute',
      rationale: 'Attribut-Cluster'
    },
    {
      question: 'Gibt es geografische Unterschiede in den Attributen?',
      targetPattern: 'location',
      rationale: 'Regional-Attribut-Unterschiede'
    }
  ]
}

// ============================================================================
// GENERAL FOLLOW-UPS
// ============================================================================

const GENERAL_FOLLOW_UPS: FollowUpSuggestion[] = [
  {
    question: 'Gibt es zeitliche Muster bei diesen Erfahrungen?',
    icon: <Calendar className="h-4 w-4" />,
    rationale: 'Temporale Analyse'
  },
  {
    question: 'Welche geografischen Cluster sind erkennbar?',
    icon: <MapPin className="h-4 w-4" />,
    rationale: 'Geografische Verteilung'
  },
  {
    question: 'Wie unterscheiden sich die Berichte in verschiedenen Kategorien?',
    icon: <TrendingUp className="h-4 w-4" />,
    rationale: 'Cross-Category Analyse'
  }
]

// ============================================================================
// COMPONENT
// ============================================================================

export function FollowUpQuestions({
  patterns = [],
  primaryCategory,
  onQuestionClick,
  maxSuggestions = 4,
  compact = false,
  className
}: FollowUpQuestionsProps) {
  // ============================================================================
  // GENERATE SUGGESTIONS
  // ============================================================================

  const suggestions = React.useMemo(() => {
    const allSuggestions: FollowUpSuggestion[] = []

    // 1. Pattern-specific follow-ups (if patterns exist)
    if (patterns.length > 0) {
      const patternTypes = [...new Set(patterns.map(p => p.type))]
      patternTypes.forEach(type => {
        const typeFollowUps = PATTERN_TYPE_FOLLOW_UPS[type] || []
        allSuggestions.push(...typeFollowUps)
      })
    }

    // 2. Category-specific follow-ups
    if (primaryCategory) {
      const categoryFollowUps = CATEGORY_FOLLOW_UPS[primaryCategory] || []
      allSuggestions.push(...categoryFollowUps)
    }

    // 3. General follow-ups
    if (allSuggestions.length < maxSuggestions) {
      allSuggestions.push(...GENERAL_FOLLOW_UPS)
    }

    // Deduplicate and limit
    const unique = Array.from(
      new Map(allSuggestions.map(s => [s.question, s])).values()
    )

    return unique.slice(0, maxSuggestions)
  }, [patterns, primaryCategory, maxSuggestions])

  // Don't render if no suggestions
  if (suggestions.length === 0) {
    return null
  }

  // ============================================================================
  // COMPACT MODE
  // ============================================================================

  if (compact) {
    return (
      <div className={cn('space-y-2', className)}>
        <p className="text-sm font-medium text-muted-foreground">
          Weiter erkunden:
        </p>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion, i) => (
            <Button
              key={i}
              variant="outline"
              size="sm"
              onClick={() => onQuestionClick(suggestion.question)}
              className="text-left h-auto py-2 px-3"
            >
              {suggestion.icon && (
                <span className="mr-2">{suggestion.icon}</span>
              )}
              <span className="text-xs">{suggestion.question}</span>
            </Button>
          ))}
        </div>
      </div>
    )
  }

  // ============================================================================
  // FULL MODE
  // ============================================================================

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <MessageSquarePlus className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">
            Weiter erkunden
          </CardTitle>
        </div>
        <CardDescription>
          Frage nach spezifischen Mustern oder tieferen Zusammenhängen
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-3">
        {suggestions.map((suggestion, i) => (
          <button
            key={i}
            onClick={() => onQuestionClick(suggestion.question)}
            className={cn(
              'group flex items-start gap-3 p-4 rounded-lg border',
              'hover:border-primary hover:bg-accent/50 transition-all',
              'text-left cursor-pointer'
            )}
          >
            {/* Icon */}
            {suggestion.icon && (
              <div className="flex-shrink-0 mt-0.5 text-muted-foreground group-hover:text-primary transition-colors">
                {suggestion.icon}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium leading-relaxed group-hover:text-primary transition-colors">
                {suggestion.question}
              </p>

              {/* Rationale */}
              {suggestion.rationale && (
                <p className="text-xs text-muted-foreground mt-1">
                  {suggestion.rationale}
                </p>
              )}

              {/* Target Pattern Badge */}
              {suggestion.targetPattern && (
                <Badge variant="outline" className="text-xs mt-2">
                  {suggestion.targetPattern}
                </Badge>
              )}
            </div>

            {/* Chevron */}
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
          </button>
        ))}
      </CardContent>
    </Card>
  )
}
