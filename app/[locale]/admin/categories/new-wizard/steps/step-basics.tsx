'use client'

import { CategoryData } from '../wizard-client'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Sparkles, Info } from 'lucide-react'

interface StepBasicsProps {
  category: CategoryData
  onUpdate: (data: Partial<CategoryData>) => void
  isGenerating: boolean
  generationError: string | null
}

const ICON_OPTIONS = ['🌟', '🔮', '👻', '🛸', '🧘', '🌙', '⚡', '🎭', '🦋', '🌊', '🔥', '💫']

export function StepBasics({ category, onUpdate, isGenerating, generationError }: StepBasicsProps) {
  const handleNameChange = (name_de: string) => {
    onUpdate({ name_de })

    // Auto-generate slug from name
    if (name_de) {
      const slug = name_de
        .toLowerCase()
        .replace(/ä/g, 'ae')
        .replace(/ö/g, 'oe')
        .replace(/ü/g, 'ue')
        .replace(/ß/g, 'ss')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')

      onUpdate({ slug })
    }
  }

  return (
    <div className="space-y-6">
      {/* Info Alert */}
      <Alert className="border-blue-200 bg-muted">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-sm">
          <strong>How it works:</strong> Describe what you want to track in natural language, and our AI will
          generate a complete schema with attributes and questions. You'll be able to review and customize everything
          in the next steps.
        </AlertDescription>
      </Alert>

      {/* Category Name */}
      <div className="space-y-2">
        <Label htmlFor="name_de">
          Category Name (German) <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name_de"
          value={category.name_de}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="e.g. Near Death Experiences, UFO-Sichtungen, Geister"
          className="text-lg"
        />
      </div>

      {/* Slug (auto-generated) */}
      <div className="space-y-2">
        <Label htmlFor="slug">
          URL Slug <span className="text-red-500">*</span>
        </Label>
        <Input
          id="slug"
          value={category.slug}
          onChange={(e) => onUpdate({ slug: e.target.value })}
          placeholder="near-death-experiences"
          className="font-mono"
        />
        <p className="text-xs text-muted-foreground">
          Auto-generated from name. Only lowercase letters, numbers, and hyphens.
        </p>
      </div>

      {/* Icon Picker */}
      <div className="space-y-2">
        <Label>Category Icon</Label>
        <div className="grid grid-cols-12 gap-2">
          {ICON_OPTIONS.map((icon) => (
            <button
              key={icon}
              type="button"
              onClick={() => onUpdate({ icon })}
              className={`
                text-2xl p-2 rounded-lg border-2 transition-all hover:scale-110
                ${category.icon === icon ? 'border-blue-500 bg-accent' : 'border-gray-200'}
              `}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description_de">Description (German)</Label>
        <Textarea
          id="description_de"
          value={category.description_de}
          onChange={(e) => onUpdate({ description_de: e.target.value })}
          placeholder="Eine kurze Beschreibung dieser Kategorie..."
          rows={2}
        />
      </div>

      {/* AI Prompt */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          <Label htmlFor="ai_prompt" className="text-base font-semibold">
            AI Prompt <span className="text-red-500">*</span>
          </Label>
        </div>
        <Textarea
          id="ai_prompt"
          value={category.ai_prompt}
          onChange={(e) => onUpdate({ ai_prompt: e.target.value })}
          placeholder="Beschreibe, was du erfassen willst. Z.B.:&#10;&#10;'Ich will Near Death Experiences erfassen. Wichtig sind: Tunnel-Erlebnis, Licht gesehen, verstorbene Personen getroffen, Gefühle während dem Erlebnis, Dauer, Auswirkungen auf das Leben danach.'"
          rows={6}
          className="font-sans"
        />
        <p className="text-xs text-muted-foreground">
          💡 <strong>Tip:</strong> Be specific about what details you want to capture. The AI will create attributes
          and questions based on this description.
        </p>
      </div>

      {/* Error Display */}
      {generationError && (
        <Alert variant="destructive">
          <AlertDescription>{generationError}</AlertDescription>
        </Alert>
      )}

      {/* Examples */}
      <div className="rounded-lg border border-gray-200 bg-muted p-4 space-y-3">
        <h4 className="font-semibold text-sm">Example Prompts:</h4>
        <div className="space-y-2 text-sm">
          <button
            type="button"
            onClick={() =>
              onUpdate({
                ai_prompt:
                  'Ich will UFO-Sichtungen erfassen. Wichtig sind: Form des Objekts, Farbe, Größe, Bewegungsmuster, Geräusche, Dauer der Sichtung, Wetterbedingungen, gab es Zeugen.',
              })
            }
            className="block w-full text-left p-2 rounded hover:bg-accent transition-colors"
          >
            <span className="font-medium">UFO Sightings:</span> Form, Farbe, Größe, Bewegungsmuster, Geräusche,
            Dauer, Wetterbedingungen, Zeugen...
          </button>
          <button
            type="button"
            onClick={() =>
              onUpdate({
                ai_prompt:
                  'Ich will Geistersichtungen dokumentieren. Wichtig sind: Art der Erscheinung (visuell/akustisch/taktil), Aussehen, Ort, Tageszeit, Temperaturänderungen, elektromagnetische Anomalien, Gefühle dabei.',
              })
            }
            className="block w-full text-left p-2 rounded hover:bg-accent transition-colors"
          >
            <span className="font-medium">Ghost Encounters:</span> Art der Erscheinung, Aussehen, Ort, Tageszeit,
            Temperatur, EM-Anomalien...
          </button>
        </div>
      </div>
    </div>
  )
}
