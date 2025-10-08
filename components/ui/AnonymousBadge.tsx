'use client'

import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { User, CheckCircle2 } from 'lucide-react'

interface AnonymousBadgeProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function AnonymousBadge({ className, size = 'md' }: AnonymousBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <Badge
            variant="secondary"
            className={`${sizeClasses[size]} gap-1 cursor-help ${className}`}
            aria-label="Verifizierter anonymer Nutzer"
          >
            <User className="h-3 w-3" aria-hidden="true" />
            <span>Anonym</span>
            <CheckCircle2 className="h-3 w-3 text-green-500" aria-hidden="true" />
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" aria-hidden="true" />
              <p className="font-semibold">Verifizierter User</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Dieser Bericht stammt von einem verifizierten Account, aber der User möchte anonym
              bleiben.
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
