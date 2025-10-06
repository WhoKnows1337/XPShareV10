'use client'

import { useState, useEffect } from 'react'
import { QuestionCategory } from '@/lib/types/admin-questions'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Save } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

interface CategoryEditorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: QuestionCategory
}

export function CategoryEditorDialog({
  open,
  onOpenChange,
  category,
}: CategoryEditorDialogProps) {
  const [name, setName] = useState(category.name)
  const [description, setDescription] = useState(category.description || '')
  const [icon, setIcon] = useState(category.icon || '')
  const [isActive, setIsActive] = useState(category.is_active)
  const [sortOrder, setSortOrder] = useState(category.sort_order)
  const [isSaving, setIsSaving] = useState(false)

  const { toast } = useToast()
  const router = useRouter()

  // Reset form when category changes
  useEffect(() => {
    setName(category.name)
    setDescription(category.description || '')
    setIcon(category.icon || '')
    setIsActive(category.is_active)
    setSortOrder(category.sort_order)
  }, [category])

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: 'Error',
        description: 'Category name is required',
        variant: 'destructive',
      })
      return
    }

    setIsSaving(true)

    try {
      const res = await fetch(`/api/admin/categories/${category.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          icon: icon.trim() || null,
          is_active: isActive,
          sort_order: sortOrder,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to update category')
      }

      toast({
        title: 'Success',
        description: 'Category updated successfully',
      })

      onOpenChange(false)
      router.refresh()
    } catch (error) {
      console.error('Save error:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update category',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Category Name */}
          <div className="space-y-2">
            <Label htmlFor="category_name">Category Name *</Label>
            <Input
              id="category_name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., UFO-Sichtungen"
              required
            />
          </div>

          {/* Icon */}
          <div className="space-y-2">
            <Label htmlFor="category_icon">Icon (Emoji)</Label>
            <div className="flex items-center gap-2">
              {icon && <span className="text-4xl">{icon}</span>}
              <Input
                id="category_icon"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="🛸"
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Use an emoji to represent this category
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="category_description">Description</Label>
            <Textarea
              id="category_description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief description of this category"
              rows={3}
            />
          </div>

          {/* Sort Order */}
          <div className="space-y-2">
            <Label htmlFor="sort_order">Sort Order</Label>
            <Input
              id="sort_order"
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(parseInt(e.target.value, 10))}
              min={0}
            />
            <p className="text-xs text-muted-foreground">
              Lower numbers appear first
            </p>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label htmlFor="is_active">Active</Label>
              <p className="text-sm text-muted-foreground">
                Inactive categories won't be shown to users
              </p>
            </div>
            <Switch
              id="is_active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>

          {/* Slug (Read-only) */}
          <div className="space-y-2">
            <Label>Slug (Read-only)</Label>
            <Input
              value={category.slug}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              The slug cannot be changed as it's used in URLs
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              'Saving...'
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
