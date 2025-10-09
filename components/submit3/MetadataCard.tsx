'use client'

import { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Edit, Sparkles } from 'lucide-react'
import { ConfidenceIndicator } from './ConfidenceIndicator'
import { motion } from 'framer-motion'

interface MetadataCardProps {
  title: string
  description?: string
  icon?: ReactNode
  aiValue?: string | string[]
  confirmedValue?: string | string[]
  confidence?: number
  isConfirmed?: boolean
  onEdit?: () => void
  onConfirm?: () => void
  children?: ReactNode
  delay?: number
}

export function MetadataCard({
  title,
  description,
  icon,
  aiValue,
  confirmedValue,
  confidence,
  isConfirmed = false,
  onEdit,
  onConfirm,
  children,
  delay = 0,
}: MetadataCardProps) {
  const displayValue = confirmedValue || aiValue
  const hasValue = displayValue && (Array.isArray(displayValue) ? displayValue.length > 0 : displayValue.length > 0)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
    >
      <Card className={`
        transition-all duration-300
        ${isConfirmed ? 'border-green-500 bg-green-50/50' : ''}
        ${aiValue && !confirmedValue ? 'border-purple-300 bg-purple-50/30' : ''}
      `}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg flex items-center gap-2">
                {icon}
                {title}
                {isConfirmed && (
                  <Badge variant="outline" className="ml-2 bg-green-100 text-green-700 border-green-300">
                    <Check className="h-3 w-3 mr-1" />
                    Confirmed
                  </Badge>
                )}
                {aiValue && !confirmedValue && (
                  <Badge variant="outline" className="ml-2 bg-purple-100 text-purple-700 border-purple-300">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI Detected
                  </Badge>
                )}
              </CardTitle>
              {description && (
                <CardDescription className="mt-1">{description}</CardDescription>
              )}
            </div>
          </div>

          {/* Confidence Indicator */}
          {confidence !== undefined && !isConfirmed && (
            <div className="mt-3">
              <ConfidenceIndicator
                confidence={confidence}
                showPercentage={true}
                variant="bar"
                size="sm"
              />
            </div>
          )}
        </CardHeader>

        <CardContent>
          {/* Custom children (e.g., editors) */}
          {children}

          {/* Display value if no custom children */}
          {!children && hasValue && (
            <div className="mb-4">
              {Array.isArray(displayValue) ? (
                <div className="flex flex-wrap gap-2">
                  {displayValue.map((val, i) => (
                    <Badge key={i} variant="secondary" className="text-sm">
                      {val}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-xl font-semibold">{displayValue}</p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            {onEdit && (
              <Button
                onClick={onEdit}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Edit className="h-4 w-4 mr-2" />
                {hasValue ? 'Edit' : 'Add'}
              </Button>
            )}
            {onConfirm && hasValue && !isConfirmed && (
              <Button
                onClick={onConfirm}
                size="sm"
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4 mr-2" />
                Confirm
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
