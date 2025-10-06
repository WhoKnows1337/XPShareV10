'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Users, X, Plus, Info } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function WitnessesPage() {
  const router = useRouter()
  const [witnesses, setWitnesses] = useState<string[]>([])
  const [newWitness, setNewWitness] = useState('')

  const handleAddWitness = () => {
    if (newWitness.trim() && !witnesses.includes(newWitness.trim())) {
      setWitnesses([...witnesses, newWitness.trim()])
      setNewWitness('')
    }
  }

  const handleRemoveWitness = (witnessToRemove: string) => {
    setWitnesses(witnesses.filter(w => w !== witnessToRemove))
  }

  const handleContinue = () => {
    // Save witnesses to localStorage
    const draft = JSON.parse(localStorage.getItem('experience_draft') || '{}')
    localStorage.setItem(
      'experience_draft',
      JSON.stringify({
        ...draft,
        witnesses,
      })
    )
    router.push('/submit/media')
  }

  const handleSkip = () => {
    router.push('/submit/media')
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">Witnesses</h1>
        <p className="text-muted-foreground">
          Were there other people who experienced this with you?
        </p>
      </div>

      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertDescription>
          You can invite witnesses to verify your experience or share their own perspective.
          They'll be notified and can choose to contribute.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-500" />
            Add Witnesses
          </CardTitle>
          <CardDescription>
            Enter usernames or email addresses of people who were present
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Witnesses */}
          {witnesses.length > 0 && (
            <div className="flex flex-wrap gap-2 pb-4 border-b">
              {witnesses.map((witness) => (
                <Badge key={witness} variant="secondary" className="gap-1 px-3 py-1.5">
                  <Users className="h-3 w-3" />
                  {witness}
                  <button
                    onClick={() => handleRemoveWitness(witness)}
                    className="ml-1 hover:text-destructive"
                    aria-label={`Remove ${witness}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Add Witness Input */}
          <div>
            <div className="flex gap-2">
              <Input
                placeholder="Enter username or email..."
                value={newWitness}
                onChange={(e) => setNewWitness(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddWitness()}
              />
              <Button onClick={handleAddWitness} variant="outline" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Press Enter or click + to add a witness
            </p>
          </div>

          {witnesses.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No witnesses added yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 flex gap-4">
        <Button onClick={handleSkip} variant="outline" className="flex-1" size="lg">
          Skip This Step
        </Button>
        <Button onClick={handleContinue} className="flex-1" size="lg">
          Continue to Media Upload →
        </Button>
      </div>
    </div>
  )
}
