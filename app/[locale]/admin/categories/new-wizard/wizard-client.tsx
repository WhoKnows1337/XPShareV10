'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { Sparkles, ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { StepBasics } from './steps/step-basics'
import { StepAttributes } from './steps/step-attributes'
import { StepQuestions } from './steps/step-questions'
import { StepPreview } from './steps/step-preview'
import { StepPublish } from './steps/step-publish'

export interface AttributeData {
  key: string
  display_name: string
  display_name_de: string
  data_type: 'text' | 'enum' | 'boolean' | 'number'
  allowed_values?: string[]
  description?: string
  reasoning?: string
}

export interface QuestionData {
  question_text: string
  question_type: string
  maps_to_attribute?: string
  options?: { label: string; value: string }[]
  priority: number
  is_optional: boolean
  reasoning?: string
  help_text?: string
  placeholder?: string
}

export interface CategoryData {
  name_de: string
  slug: string
  icon: string
  description_de: string
  ai_prompt: string
}

export interface WizardState {
  category: CategoryData
  attributes: AttributeData[]
  questions: QuestionData[]
  isGenerating: boolean
  generationError: string | null
}

const STEPS = [
  { id: 1, title: 'Category Basics', description: 'Name, icon, and AI prompt' },
  { id: 2, title: 'Attributes', description: 'Review & edit generated attributes' },
  { id: 3, title: 'Questions', description: 'Review & edit generated questions' },
  { id: 4, title: 'Preview', description: 'See how it looks to users' },
  { id: 5, title: 'Publish', description: 'Create the category' },
]

export function CategoryCreationWizard() {
  const router = useRouter()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [wizardState, setWizardState] = useState<WizardState>({
    category: {
      name_de: '',
      slug: '',
      icon: '🌟',
      description_de: '',
      ai_prompt: '',
    },
    attributes: [],
    questions: [],
    isGenerating: false,
    generationError: null,
  })

  const progress = (currentStep / STEPS.length) * 100

  const updateCategory = (data: Partial<CategoryData>) => {
    setWizardState((prev) => ({
      ...prev,
      category: { ...prev.category, ...data },
    }))
  }

  const updateAttributes = (attributes: AttributeData[]) => {
    setWizardState((prev) => ({ ...prev, attributes }))
  }

  const updateQuestions = (questions: QuestionData[]) => {
    setWizardState((prev) => ({ ...prev, questions }))
  }

  const generateSchema = async () => {
    if (!wizardState.category.ai_prompt.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide an AI prompt describing what you want to track',
        variant: 'destructive',
      })
      return false
    }

    setWizardState((prev) => ({ ...prev, isGenerating: true, generationError: null }))

    try {
      const response = await fetch('/api/admin/ai-generate-schema', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: wizardState.category.ai_prompt,
          category_slug: wizardState.category.slug,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate schema')
      }

      const data = await response.json()
      const { attributes, questions } = data.schema

      setWizardState((prev) => ({
        ...prev,
        attributes: attributes || [],
        questions: questions || [],
        isGenerating: false,
      }))

      toast({
        title: 'Schema Generated!',
        description: `Created ${attributes?.length || 0} attributes and ${questions?.length || 0} questions`,
      })

      return true
    } catch (error) {
      console.error('Schema generation error:', error)
      setWizardState((prev) => ({
        ...prev,
        isGenerating: false,
        generationError: error instanceof Error ? error.message : 'Failed to generate schema',
      }))

      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Failed to generate schema',
        variant: 'destructive',
      })

      return false
    }
  }

  const handleNext = async () => {
    // Step 1 → 2: Validate basics and generate schema
    if (currentStep === 1) {
      if (!wizardState.category.name_de || !wizardState.category.slug) {
        toast({
          title: 'Missing Information',
          description: 'Please fill in category name and slug',
          variant: 'destructive',
        })
        return
      }

      const success = await generateSchema()
      if (!success) return
    }

    // Step 2 → 3: Validate attributes
    if (currentStep === 2) {
      if (wizardState.attributes.length === 0) {
        toast({
          title: 'No Attributes',
          description: 'Please add at least one attribute or go back to regenerate',
          variant: 'destructive',
        })
        return
      }
    }

    // Step 3 → 4: Validate questions
    if (currentStep === 3) {
      if (wizardState.questions.length === 0) {
        toast({
          title: 'No Questions',
          description: 'Please add at least one question or go back to regenerate',
          variant: 'destructive',
        })
        return
      }
    }

    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length))
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <StepBasics
            category={wizardState.category}
            onUpdate={updateCategory}
            isGenerating={wizardState.isGenerating}
            generationError={wizardState.generationError}
          />
        )
      case 2:
        return (
          <StepAttributes
            attributes={wizardState.attributes}
            onUpdate={updateAttributes}
          />
        )
      case 3:
        return (
          <StepQuestions
            questions={wizardState.questions}
            attributes={wizardState.attributes}
            onUpdate={updateQuestions}
          />
        )
      case 4:
        return (
          <StepPreview
            category={wizardState.category}
            attributes={wizardState.attributes}
            questions={wizardState.questions}
          />
        )
      case 5:
        return (
          <StepPublish
            wizardState={wizardState}
            onSuccess={(slug) => {
              router.push(`/admin/categories/${slug}`)
            }}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">AI Category Wizard</h1>
          <p className="text-muted-foreground">
            Create a complete category with attributes and questions from a simple description
          </p>
        </div>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">
                  Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {STEPS[currentStep - 1].description}
                </p>
              </div>
              <div className="text-sm font-medium text-muted-foreground">
                {Math.round(progress)}% Complete
              </div>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardContent className="pt-6">{renderStep()}</CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1 || wizardState.isGenerating}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={() => router.push('/admin/categories')}
            disabled={wizardState.isGenerating}
          >
            Cancel
          </Button>

          {currentStep < STEPS.length ? (
            <Button onClick={handleNext} disabled={wizardState.isGenerating}>
              {wizardState.isGenerating ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          ) : (
            <Button onClick={handleNext} className="bg-green-600 hover:bg-green-700">
              <Check className="mr-2 h-4 w-4" />
              Publish Category
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
