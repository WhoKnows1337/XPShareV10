/**
 * Error Display Component
 *
 * Shows structured errors with recovery actions.
 * Provides better UX than generic error messages.
 */

'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertCircle,
  AlertTriangle,
  Info,
  XCircle,
  RefreshCw,
  LogIn,
  Mail,
} from 'lucide-react'
import { StructuredError, RecoveryAction } from '@/lib/errors/error-types'

export interface ErrorDisplayProps {
  error: StructuredError
  onRetry?: () => void
  onDismiss?: () => void
  showTechnicalDetails?: boolean
}

export function ErrorDisplay({
  error,
  onRetry,
  onDismiss,
  showTechnicalDetails = false,
}: ErrorDisplayProps) {
  // Get icon based on severity
  const getIcon = () => {
    switch (error.severity) {
      case 'critical':
        return <XCircle className="h-5 w-5" />
      case 'error':
        return <AlertCircle className="h-5 w-5" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5" />
      case 'info':
        return <Info className="h-5 w-5" />
      default:
        return <AlertCircle className="h-5 w-5" />
    }
  }

  // Get alert variant
  const getVariant = () => {
    if (error.severity === 'critical' || error.severity === 'error') return 'destructive'
    if (error.severity === 'warning') return 'default'
    return 'default'
  }

  // Handle recovery action
  const handleRecoveryAction = (action: RecoveryAction) => {
    switch (action.action) {
      case 'retry':
        onRetry?.()
        break
      case 'refresh':
        window.location.reload()
        break
      case 'login':
        window.location.href = '/login'
        break
      case 'contact_support':
        window.location.href = 'mailto:support@xpshare.com'
        break
      case 'custom':
        action.handler?.()
        break
    }
  }

  // Get action icon
  const getActionIcon = (action: RecoveryAction['action']) => {
    switch (action) {
      case 'retry':
        return <RefreshCw className="h-4 w-4" />
      case 'login':
        return <LogIn className="h-4 w-4" />
      case 'contact_support':
        return <Mail className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <Alert variant={getVariant()} className="my-4">
      <div className="flex items-start gap-3">
        {getIcon()}
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <AlertTitle className="mb-0">
              {error.category === 'network' && 'Connection Error'}
              {error.category === 'authentication' && 'Authentication Required'}
              {error.category === 'rate_limit' && 'Rate Limit Reached'}
              {error.category === 'validation' && 'Invalid Input'}
              {error.category === 'timeout' && 'Request Timeout'}
              {error.category === 'server' && 'Server Error'}
              {error.category === 'unknown' && 'Error'}
            </AlertTitle>
            <Badge variant="outline" className="text-xs">
              {error.code}
            </Badge>
          </div>

          <AlertDescription className="text-sm">
            {error.userMessage}
          </AlertDescription>

          {/* Technical Details (collapsed by default) */}
          {showTechnicalDetails && error.technicalDetails && (
            <details className="text-xs text-muted-foreground mt-2">
              <summary className="cursor-pointer hover:text-foreground">
                Technical Details
              </summary>
              <pre className="mt-2 p-2 bg-muted rounded overflow-x-auto">
                {error.technicalDetails}
              </pre>
              {error.context && (
                <pre className="mt-1 p-2 bg-muted rounded overflow-x-auto">
                  {JSON.stringify(error.context, null, 2)}
                </pre>
              )}
            </details>
          )}

          {/* Recovery Actions */}
          {error.recoveryActions.length > 0 && (
            <div className="flex items-center gap-2 mt-3">
              {error.recoveryActions.map((action, index) => (
                <Button
                  key={index}
                  variant={index === 0 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleRecoveryAction(action)}
                >
                  {getActionIcon(action.action)}
                  {action.label}
                </Button>
              ))}
              {onDismiss && (
                <Button variant="ghost" size="sm" onClick={onDismiss}>
                  Dismiss
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Alert>
  )
}

/**
 * Inline error display (for smaller spaces)
 */
export function InlineErrorDisplay({
  error,
  onRetry,
}: {
  error: StructuredError
  onRetry?: () => void
}) {
  return (
    <div className="flex items-center gap-2 p-3 rounded-lg border border-destructive/50 bg-destructive/10">
      <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
      <p className="text-sm text-destructive flex-1">{error.userMessage}</p>
      {onRetry && (
        <Button variant="ghost" size="sm" className="h-7" onClick={onRetry}>
          <RefreshCw className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}

/**
 * Toast-style error notification
 */
export function ErrorToast({ error }: { error: StructuredError }) {
  return (
    <div className="flex items-start gap-3">
      <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-semibold">{error.message}</p>
        <p className="text-xs text-muted-foreground mt-1">{error.userMessage}</p>
      </div>
    </div>
  )
}
