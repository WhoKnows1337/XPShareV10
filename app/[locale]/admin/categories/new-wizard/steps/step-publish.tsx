'use client'

import { useState } from 'react'
import { WizardState } from '../wizard-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Rocket, CheckCircle2, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface StepPublishProps {
  wizardState: WizardState
  onSuccess: (slug: string) => void
}

export function StepPublish({ wizardState, onSuccess }: StepPublishProps) {
  const { toast } = useToast()
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishError, setPublishError] = useState<string | null>(null)
  const [publishSuccess, setPublishSuccess] = useState(false)

  const handlePublish = async () => {
    setIsPublishing(true)
    setPublishError(null)

    try {
      // Step 1: Create category
      const categoryResponse = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: wizardState.category.name_de,
          slug: wizardState.category.slug,
          icon: wizardState.category.icon,
          description: wizardState.category.description_de,
        }),
      })

      if (!categoryResponse.ok) {
        const error = await categoryResponse.json()
        throw new Error(error.error || 'Failed to create category')
      }

      const { data: category } = await categoryResponse.json()

      // Step 2: Create attributes
      const attributePromises = wizardState.attributes.map((attr) =>
        fetch('/api/admin/attributes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            category_slug: wizardState.category.slug,
            key: attr.key,
            display_name: attr.display_name,
            display_name_de: attr.display_name_de,
            data_type: attr.data_type,
            allowed_values: attr.allowed_values,
            description: attr.description,
          }),
        })
      )

      await Promise.all(attributePromises)

      // Step 3: Create questions
      const questionPromises = wizardState.questions.map((question) =>
        fetch('/api/admin/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            category_id: category.id,
            question_text: question.question_text,
            question_type: question.question_type,
            options: question.options,
            priority: question.priority,
            is_optional: question.is_optional,
            help_text: question.help_text,
            placeholder: question.placeholder,
            maps_to_attribute: question.maps_to_attribute,
            is_active: true,
          }),
        })
      )

      await Promise.all(questionPromises)

      // Success!
      setPublishSuccess(true)
      toast({
        title: 'Category Published! 🎉',
        description: `${wizardState.category.name_de} is now live with ${wizardState.attributes.length} attributes and ${wizardState.questions.length} questions.`,
      })

      // Redirect after a moment
      setTimeout(() => {
        onSuccess(wizardState.category.slug)
      }, 1500)
    } catch (error) {
      console.error('Publish error:', error)
      setPublishError(error instanceof Error ? error.message : 'Failed to publish category')
      toast({
        title: 'Publish Failed',
        description: error instanceof Error ? error.message : 'Failed to publish category',
        variant: 'destructive',
      })
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="p-4 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full">
            <Rocket className="w-8 h-8 text-white" />
          </div>
        </div>
        <h3 className="text-2xl font-bold">Ready to Publish!</h3>
        <p className="text-muted-foreground">
          Everything looks good. Click the button below to create your category.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <span>{wizardState.category.icon}</span>
              <span>1</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{wizardState.category.name_de}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Attributes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{wizardState.attributes.length}</div>
            <p className="text-xs text-muted-foreground mt-1">For pattern matching</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{wizardState.questions.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {wizardState.questions.filter((q) => !q.is_optional).length} required
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Success State */}
      {publishSuccess && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Success!</strong> Your category has been published. Redirecting to category page...
          </AlertDescription>
        </Alert>
      )}

      {/* Error State */}
      {publishError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{publishError}</AlertDescription>
        </Alert>
      )}

      {/* What Happens Next */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">What happens when you publish?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex gap-2">
            <span className="text-green-600">✓</span>
            <span>Category will be created in the database</span>
          </div>
          <div className="flex gap-2">
            <span className="text-green-600">✓</span>
            <span>All {wizardState.attributes.length} attributes will be added to the attribute schema</span>
          </div>
          <div className="flex gap-2">
            <span className="text-green-600">✓</span>
            <span>All {wizardState.questions.length} questions will be created and linked to the category</span>
          </div>
          <div className="flex gap-2">
            <span className="text-green-600">✓</span>
            <span>Category will appear in the main category selection for users</span>
          </div>
          <div className="flex gap-2">
            <span className="text-green-600">✓</span>
            <span>You'll be redirected to the category management page</span>
          </div>
        </CardContent>
      </Card>

      {/* Publish Button */}
      <div className="flex justify-center pt-4">
        <Button
          size="lg"
          onClick={handlePublish}
          disabled={isPublishing || publishSuccess}
          className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
        >
          {isPublishing ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Publishing...
            </>
          ) : publishSuccess ? (
            <>
              <CheckCircle2 className="mr-2 h-5 w-5" />
              Published!
            </>
          ) : (
            <>
              <Rocket className="mr-2 h-5 w-5" />
              Publish Category
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
