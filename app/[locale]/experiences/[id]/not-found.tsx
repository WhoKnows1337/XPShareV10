import Link from 'next/link'
import { FileQuestion } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
            <FileQuestion className="w-8 h-8 text-muted-foreground" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Experience not found</h1>
            <p className="text-muted-foreground">
              This experience doesn't exist or has been removed.
            </p>
          </div>

          <div className="flex gap-2 justify-center pt-2">
            <Button asChild>
              <Link href="/experiences">Browse experiences</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Go home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
