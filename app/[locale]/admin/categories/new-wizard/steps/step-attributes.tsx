'use client'

import { useState } from 'react'
import { AttributeData } from '../wizard-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react'

interface StepAttributesProps {
  attributes: AttributeData[]
  onUpdate: (attributes: AttributeData[]) => void
}

export function StepAttributes({ attributes, onUpdate }: StepAttributesProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<AttributeData | null>(null)

  const handleEdit = (index: number) => {
    setEditingIndex(index)
    setEditForm({ ...attributes[index] })
  }

  const handleSaveEdit = () => {
    if (editingIndex === null || !editForm) return

    const updated = [...attributes]
    updated[editingIndex] = editForm
    onUpdate(updated)
    setEditingIndex(null)
    setEditForm(null)
  }

  const handleCancelEdit = () => {
    setEditingIndex(null)
    setEditForm(null)
  }

  const handleDelete = (index: number) => {
    const updated = attributes.filter((_, i) => i !== index)
    onUpdate(updated)
  }

  const handleAdd = () => {
    const newAttribute: AttributeData = {
      key: '',
      display_name: '',
      display_name_de: '',
      data_type: 'text',
      description: '',
      reasoning: '',
    }
    onUpdate([...attributes, newAttribute])
    setEditingIndex(attributes.length)
    setEditForm(newAttribute)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Generated Attributes ({attributes.length})</h3>
        <p className="text-sm text-muted-foreground">
          Review and customize the attributes that will be tracked for this category. These are used for pattern
          matching and analysis.
        </p>
      </div>

      {/* Attributes List */}
      <div className="space-y-3">
        {attributes.map((attr, index) => (
          <Card key={index} className="relative">
            {editingIndex === index && editForm ? (
              // Edit Mode
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Key (snake_case)</Label>
                    <Input
                      value={editForm.key}
                      onChange={(e) => setEditForm({ ...editForm, key: e.target.value })}
                      placeholder="attribute_key"
                      className="font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Display Name (English)</Label>
                    <Input
                      value={editForm.display_name}
                      onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })}
                      placeholder="Attribute Name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Display Name (German)</Label>
                    <Input
                      value={editForm.display_name_de}
                      onChange={(e) => setEditForm({ ...editForm, display_name_de: e.target.value })}
                      placeholder="Attributname"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Data Type</Label>
                    <Select
                      value={editForm.data_type}
                      onValueChange={(val) => setEditForm({ ...editForm, data_type: val as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="enum">Enum (predefined values)</SelectItem>
                        <SelectItem value="boolean">Boolean</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {editForm.data_type === 'enum' && (
                  <div className="space-y-2">
                    <Label>Allowed Values (comma-separated)</Label>
                    <Input
                      value={editForm.allowed_values?.join(', ') || ''}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          allowed_values: e.target.value.split(',').map((v) => v.trim()),
                        })
                      }
                      placeholder="value1, value2, value3"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={2}
                    placeholder="What does this attribute capture?"
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSaveEdit} size="sm">
                    <Check className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                  <Button onClick={handleCancelEdit} variant="outline" size="sm">
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            ) : (
              // View Mode
              <>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{attr.display_name_de || attr.display_name}</CardTitle>
                        <Badge variant="outline" className="font-mono text-xs">
                          {attr.key}
                        </Badge>
                        <Badge variant="secondary">{attr.data_type}</Badge>
                      </div>
                      {attr.description && (
                        <p className="text-sm text-muted-foreground">{attr.description}</p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(index)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(index)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {attr.allowed_values && attr.allowed_values.length > 0 && (
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-1">
                      <span className="text-xs text-muted-foreground">Allowed values:</span>
                      {attr.allowed_values.map((val, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {val}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                )}
              </>
            )}
          </Card>
        ))}
      </div>

      {/* Add New Button */}
      <Button onClick={handleAdd} variant="outline" className="w-full">
        <Plus className="mr-2 h-4 w-4" />
        Add Custom Attribute
      </Button>

      {attributes.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No attributes generated. Go back and provide an AI prompt.</p>
        </div>
      )}
    </div>
  )
}
