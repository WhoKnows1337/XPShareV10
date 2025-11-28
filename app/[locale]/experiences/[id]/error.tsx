'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Something went wrong</h1>
            <p className="text-muted-foreground">
              We encountered an error while loading this experience. Please try again.
            </p>
          </div>

          {/* Show error details for debugging */}
          <div className="text-left bg-destructive/5 p-4 rounded-lg text-xs font-mono overflow-auto max-h-40">
            <p className="font-bold text-destructive mb-2">{error.name}: {error.message}</p>
            {error.digest && <p className="text-muted-foreground">Digest: {error.digest}</p>}
          </div>

          <div className="flex gap-2 justify-center pt-2">
            <Button onClick={reset} variant="default">
              Try again
            </Button>
            <Button onClick={() => window.history.back()} variant="outline">
              Go back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
