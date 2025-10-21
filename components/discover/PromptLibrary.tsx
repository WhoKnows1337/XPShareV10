/**
 * Prompt Library Component
 *
 * Browse, search, and use prompt templates.
 * Supports variable substitution and favorites.
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Star, StarOff, Send, Sparkles, TrendingUp, Network, Filter } from 'lucide-react'
import { toast } from 'sonner'
import {
  PromptTemplate,
  TemplateVariable,
  getTemplates,
  fillTemplate,
  toggleFavorite,
  incrementTemplateUse,
} from '@/lib/prompts/template-manager'

export interface PromptLibraryProps {
  onUseTemplate: (prompt: string) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function PromptLibrary({ onUseTemplate, open, onOpenChange }: PromptLibraryProps) {
  const [templates, setTemplates] = useState<PromptTemplate[]>([])
  const [filteredTemplates, setFilteredTemplates] = useState<PromptTemplate[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null)
  const [variables, setVariables] = useState<Record<string, string>>({})

  // Load templates
  useEffect(() => {
    loadTemplates()
  }, [])

  // Filter templates
  useEffect(() => {
    let filtered = templates

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((t) => t.category === selectedCategory)
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query) ||
          t.promptText.toLowerCase().includes(query)
      )
    }

    setFilteredTemplates(filtered)
  }, [templates, selectedCategory, searchQuery])

  async function loadTemplates() {
    setLoading(true)
    const data = await getTemplates()
    setTemplates(data)
    setFilteredTemplates(data)
    setLoading(false)
  }

  function handleUseTemplate(template: PromptTemplate) {
    if (template.variables.length === 0) {
      // No variables, use directly
      incrementTemplateUse(template.id)
      onUseTemplate(template.promptText)
      onOpenChange?.(false)
      toast.success('Template applied')
    } else {
      // Has variables, show form
      setSelectedTemplate(template)
      setVariables({})
    }
  }

  function handleFillTemplate() {
    if (!selectedTemplate) return

    const templateVars: TemplateVariable[] = selectedTemplate.variables.map((name) => ({
      name,
      value: variables[name] || '',
    }))

    // Check if all variables are filled
    const missingVars = selectedTemplate.variables.filter((v) => !variables[v]?.trim())
    if (missingVars.length > 0) {
      toast.error(`Please fill in: ${missingVars.join(', ')}`)
      return
    }

    const filled = fillTemplate(selectedTemplate, templateVars)
    incrementTemplateUse(selectedTemplate.id)
    onUseTemplate(filled)
    setSelectedTemplate(null)
    setVariables({})
    onOpenChange?.(false)
    toast.success('Template applied')
  }

  async function handleToggleFavorite(template: PromptTemplate, e: React.MouseEvent) {
    e.stopPropagation()
    const success = await toggleFavorite(template.id, !template.isFavorite)
    if (success) {
      setTemplates((prev) =>
        prev.map((t) => (t.id === template.id ? { ...t, isFavorite: !t.isFavorite } : t))
      )
      toast.success(template.isFavorite ? 'Removed from favorites' : 'Added to favorites')
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'search':
        return <Search className="h-4 w-4" />
      case 'analytics':
        return <TrendingUp className="h-4 w-4" />
      case 'patterns':
        return <Network className="h-4 w-4" />
      default:
        return <Sparkles className="h-4 w-4" />
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Prompt Library</DialogTitle>
          <DialogDescription>
            Choose from pre-built templates to quickly explore experiences
          </DialogDescription>
        </DialogHeader>

        {/* Search & Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="search">Search</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="patterns">Patterns</TabsTrigger>
              <TabsTrigger value="general">General</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Template List */}
        <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Loading templates...</p>
          ) : filteredTemplates.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No templates found</p>
          ) : (
            filteredTemplates.map((template) => (
              <Card
                key={template.id}
                className="cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => handleUseTemplate(template)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      {getCategoryIcon(template.category)}
                      <CardTitle className="text-base">{template.title}</CardTitle>
                      {template.isSystem && (
                        <Badge variant="outline" className="text-xs">
                          System
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={(e) => handleToggleFavorite(template, e)}
                      >
                        {template.isFavorite ? (
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ) : (
                          <StarOff className="h-4 w-4" />
                        )}
                      </Button>
                      {template.useCount > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {template.useCount} uses
                        </Badge>
                      )}
                    </div>
                  </div>
                  {template.description && (
                    <CardDescription className="text-xs">{template.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {template.promptText}
                  </p>
                  {template.variables.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {template.variables.map((variable) => (
                        <Badge key={variable} variant="outline" className="text-xs">
                          {variable}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Variable Form Dialog */}
        {selectedTemplate && (
          <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{selectedTemplate.title}</DialogTitle>
                <DialogDescription>Fill in the variables to use this template</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {selectedTemplate.variables.map((variable) => (
                  <div key={variable} className="space-y-2">
                    <Label htmlFor={variable}>{variable}</Label>
                    <Input
                      id={variable}
                      placeholder={`Enter ${variable}...`}
                      value={variables[variable] || ''}
                      onChange={(e) =>
                        setVariables((prev) => ({ ...prev, [variable]: e.target.value }))
                      }
                    />
                  </div>
                ))}

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleFillTemplate} className="flex-1">
                    <Send className="h-4 w-4 mr-2" />
                    Use Template
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  )
}
