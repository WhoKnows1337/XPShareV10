'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Save, Copy, Download, Upload } from 'lucide-react'

interface Template {
  id: string
  name: string
  description: string | null
  category_id: string | null
  questions: any[]
  tags: string[]
  is_public: boolean
  usage_count: number
  created_at: string
}

interface QuestionTemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categoryId?: string
  currentQuestions?: any[]
  onApplyTemplate?: (template: Template) => void
}

export function QuestionTemplateDialog({
  open,
  onOpenChange,
  categoryId,
  currentQuestions = [],
  onApplyTemplate,
}: QuestionTemplateDialogProps) {
  const [mode, setMode] = useState<'list' | 'create' | 'apply'>('list')
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(false)

  // Create form state
  const [templateName, setTemplateName] = useState('')
  const [templateDescription, setTemplateDescription] = useState('')
  const [templateTags, setTemplateTags] = useState('')
  const [isPublic, setIsPublic] = useState(false)

  useEffect(() => {
    if (open) {
      fetchTemplates()
    }
  }, [open])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/templates')
      if (!response.ok) throw new Error('Failed to fetch templates')

      const data = await response.json()
      setTemplates(data.data || [])
    } catch (error) {
      console.error('Error fetching templates:', error)
      toast.error('Fehler beim Laden der Templates')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTemplate = async () => {
    if (!templateName.trim()) {
      toast.error('Bitte gib einen Namen ein')
      return
    }

    if (currentQuestions.length === 0) {
      toast.error('Keine Fragen zum Speichern vorhanden')
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/admin/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: templateName,
          description: templateDescription || null,
          category_id: categoryId || null,
          questions: currentQuestions,
          tags: templateTags.split(',').map(t => t.trim()).filter(Boolean),
          is_public: isPublic,
        }),
      })

      if (!response.ok) throw new Error('Failed to create template')

      toast.success('Template erstellt')
      setMode('list')
      setTemplateName('')
      setTemplateDescription('')
      setTemplateTags('')
      setIsPublic(false)
      fetchTemplates()
    } catch (error) {
      console.error('Error creating template:', error)
      toast.error('Fehler beim Erstellen des Templates')
    } finally {
      setLoading(false)
    }
  }

  const handleApplyTemplate = async (template: Template) => {
    if (!onApplyTemplate) return

    try {
      // Increment usage count
      await fetch(`/api/admin/templates/${template.id}/apply`, {
        method: 'POST',
      })

      onApplyTemplate(template)
      toast.success(`Template "${template.name}" angewendet`)
      onOpenChange(false)
    } catch (error) {
      console.error('Error applying template:', error)
      toast.error('Fehler beim Anwenden des Templates')
    }
  }

  const handleExportTemplate = (template: Template) => {
    const dataStr = JSON.stringify(template, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `template-${template.name.toLowerCase().replace(/\s+/g, '-')}.json`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('Template exportiert')
  }

  const handleImportTemplate = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const imported = JSON.parse(text)

      const response = await fetch('/api/admin/templates/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(imported),
      })

      if (!response.ok) throw new Error('Failed to import template')

      toast.success('Template importiert')
      fetchTemplates()
    } catch (error) {
      console.error('Error importing template:', error)
      toast.error('Fehler beim Importieren des Templates')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'list' && 'Question Templates'}
            {mode === 'create' && 'Neues Template erstellen'}
            {mode === 'apply' && 'Template anwenden'}
          </DialogTitle>
        </DialogHeader>

        {/* List Mode */}
        {mode === 'list' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={() => setMode('create')} disabled={currentQuestions.length === 0}>
                <Save className="w-4 h-4 mr-2" />
                Aktuelles Set speichern
              </Button>
              <div>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportTemplate}
                  className="hidden"
                  id="import-template-file"
                />
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => document.getElementById('import-template-file')?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Importieren
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="py-8 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : templates.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                Keine Templates vorhanden
              </div>
            ) : (
              <div className="space-y-2">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold">{template.name}</h4>
                        {template.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {template.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>{template.questions.length} Fragen</span>
                          <span>✓ {template.usage_count}x verwendet</span>
                          {template.is_public && <span className="text-green-600">Öffentlich</span>}
                        </div>
                        {template.tags && template.tags.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {template.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-xs rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {onApplyTemplate && (
                          <Button
                            size="sm"
                            onClick={() => handleApplyTemplate(template)}
                          >
                            <Copy className="w-4 h-4 mr-1" />
                            Anwenden
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleExportTemplate(template)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Create Mode */}
        {mode === 'create' && (
          <div className="space-y-4">
            <div>
              <Label>Template Name *</Label>
              <Input
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="z.B. UFO Standard Fragen"
              />
            </div>

            <div>
              <Label>Beschreibung</Label>
              <Textarea
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="Beschreibe wofür dieses Template verwendet wird..."
                rows={3}
              />
            </div>

            <div>
              <Label>Tags (komma-getrennt)</Label>
              <Input
                value={templateTags}
                onChange={(e) => setTemplateTags(e.target.value)}
                placeholder="ufo, standard, deutsch"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is-public"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-4 h-4"
              />
              <Label htmlFor="is-public" className="cursor-pointer">
                Öffentlich (für alle Admins sichtbar)
              </Label>
            </div>

            <div className="border rounded p-3 bg-gray-50 dark:bg-gray-800">
              <p className="text-sm font-medium mb-2">
                Enthaltene Fragen: {currentQuestions.length}
              </p>
              <div className="max-h-40 overflow-y-auto text-xs text-gray-600 dark:text-gray-400 space-y-1">
                {currentQuestions.map((q, idx) => (
                  <div key={idx}>
                    {idx + 1}. {q.question_text}
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={() => setMode('list')}>
                Abbrechen
              </Button>
              <Button onClick={handleCreateTemplate} disabled={loading}>
                Template erstellen
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
