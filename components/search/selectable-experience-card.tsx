'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { EnhancedExperienceCard } from '@/components/experience/enhanced-experience-card'
import { cn } from '@/lib/utils'

interface SelectableExperienceCardProps {
  experience: any
  size?: 'default' | 'large' | 'wide'
  className?: string
  isSelected: boolean
  onSelectionChange: (id: string, selected: boolean) => void
  selectionMode: boolean
}

export function SelectableExperienceCard({
  experience,
  size,
  className,
  isSelected,
  onSelectionChange,
  selectionMode,
}: SelectableExperienceCardProps) {
  return (
    <div className="relative group">
      {/* Selection Checkbox - Always rendered but only visible in selection mode */}
      {selectionMode && (
        <div className="absolute top-3 right-3 z-10">
          <div
            className={cn(
              'rounded-md bg-background/95 backdrop-blur-sm p-2 shadow-md',
              'transition-all duration-200',
              isSelected && 'bg-primary/10'
            )}
          >
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) => {
                onSelectionChange(experience.id, checked as boolean)
              }}
              onClick={(e) => {
                // Prevent card click when clicking checkbox
                e.stopPropagation()
              }}
              className={cn(
                'h-5 w-5',
                isSelected && 'data-[state=checked]:bg-primary data-[state=checked]:border-primary'
              )}
            />
          </div>
        </div>
      )}

      {/* Experience Card with selection highlight */}
      <div
        className={cn(
          'transition-all duration-200',
          isSelected && 'ring-2 ring-primary ring-offset-2',
          selectionMode && 'cursor-pointer'
        )}
        onClick={(e) => {
          if (selectionMode) {
            // Toggle selection when clicking anywhere on card in selection mode
            onSelectionChange(experience.id, !isSelected)
            e.preventDefault()
          }
        }}
      >
        <EnhancedExperienceCard
          experience={experience}
          size={size}
          className={className}
        />
      </div>
    </div>
  )
}
