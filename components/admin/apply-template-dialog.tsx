'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { FileText, Users, Calendar } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Template {
  id: string
  name: string
  description: string | null
  questions: any[]
  tags: string[]
  usage_count: number
  is_public: boolean
  created_at: string
  created_by: string | null
}

interface ApplyTemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categoryId: string
  onApplied: () => void
}

export function ApplyTemplateDialog({
  open,
  onOpenChange,
  categoryId,
  onApplied,
}: ApplyTemplateDialogProps) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(false)
  const [applying, setApplying] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      loadTemplates()
    }
  }, [open])

  const loadTemplates = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/templates')
      if (!res.ok) throw new Error('Failed to load templates')
      const { data } = await res.json()
      setTemplates(data || [])
    } catch (error) {
      console.error('Load templates error:', error)
      toast({
        title: 'Error',
        description: 'Failed to load templates',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApply = async (templateId: string) => {
    if (!confirm('This will add all questions from the template to this category. Continue?')) {
      return
    }

    setApplying(true)
    try {
      const res = await fetch(`/api/admin/templates/${templateId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category_id: categoryId }),
      })

      if (!res.ok) throw new Error('Failed to apply template')

      toast({
        title: 'Success',
        description: 'Template applied successfully',
      })

      onOpenChange(false)
      onApplied()
    } catch (error) {
      console.error('Apply template error:', error)
      toast({
        title: 'Error',
        description: 'Failed to apply template',
        variant: 'destructive',
      })
    } finally {
      setApplying(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Apply Template</DialogTitle>
          <DialogDescription>
            Select a template to add its questions to this category
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">Loading templates...</p>
          </div>
        ) : templates.length === 0 ? (
          <div className="py-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No templates found</h3>
            <p className="text-sm text-muted-foreground">
              Create a template first by using "Als Template" button
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {templates.map((template) => (
              <Card key={template.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{template.name}</h3>
                      {template.is_public && (
                        <Badge variant="secondary" className="text-xs">
                          <Users className="mr-1 h-3 w-3" />
                          Public
                        </Badge>
                      )}
                    </div>

                    {template.description && (
                      <p className="text-sm text-muted-foreground">
                        {template.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {template.questions?.length || 0} questions
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        Used {template.usage_count} times
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(template.created_at).toLocaleDateString('de-DE')}
                      </div>
                    </div>

                    {template.tags.length > 0 && (
                      <div className="flex gap-1">
                        {template.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={() => handleApply(template.id)}
                    disabled={applying}
                    size="sm"
                  >
                    Apply
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
