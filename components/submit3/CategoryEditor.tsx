'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search } from 'lucide-react'
import { motion } from 'framer-motion'

interface Category {
  slug: string
  label: string
  emoji: string
  description: string
}

const CATEGORIES: Category[] = [
  { slug: 'ufo-sighting', label: 'UFO Sighting', emoji: '🛸', description: 'Unidentified flying objects' },
  { slug: 'entity-encounter', label: 'Entity Encounter', emoji: '👽', description: 'Contact with beings' },
  { slug: 'paranormal-activity', label: 'Paranormal', emoji: '👻', description: 'Ghostly phenomena' },
  { slug: 'time-anomaly', label: 'Time Anomaly', emoji: '⏰', description: 'Time distortions' },
  { slug: 'precognition', label: 'Precognition', emoji: '🔮', description: 'Future knowledge' },
  { slug: 'telekinesis', label: 'Telekinesis', emoji: '🌀', description: 'Mind over matter' },
  { slug: 'telepathy', label: 'Telepathy', emoji: '🧠', description: 'Mind-to-mind communication' },
  { slug: 'astral-projection', label: 'Astral Projection', emoji: '✨', description: 'Out-of-body experiences' },
  { slug: 'cryptid-encounter', label: 'Cryptid', emoji: '🦎', description: 'Unknown creatures' },
  { slug: 'dimensional-shift', label: 'Dimensional Shift', emoji: '🌌', description: 'Reality shifts' },
  { slug: 'lucid-dreams', label: 'Lucid Dreams', emoji: '💭', description: 'Conscious dreaming' },
  { slug: 'nightmares', label: 'Nightmares', emoji: '😱', description: 'Disturbing dreams' },
  { slug: 'psychedelic-experience', label: 'Psychedelic', emoji: '🌈', description: 'Altered states' },
  { slug: 'spiritual-awakening', label: 'Spiritual', emoji: '🙏', description: 'Spiritual experiences' },
  { slug: 'synchronicity', label: 'Synchronicity', emoji: '🔗', description: 'Meaningful coincidences' },
  { slug: 'near-death', label: 'Near-Death Experience', emoji: '💫', description: 'NDE phenomena' },
  { slug: 'other', label: 'Other Experience', emoji: '🌟', description: 'Other phenomena' },
]

interface CategoryEditorProps {
  open: boolean
  onClose: () => void
  currentCategory?: string
  onSelect: (category: string) => void
}

export function CategoryEditor({
  open,
  onClose,
  currentCategory,
  onSelect,
}: CategoryEditorProps) {
  const [search, setSearch] = useState('')

  const filteredCategories = CATEGORIES.filter(cat =>
    cat.label.toLowerCase().includes(search.toLowerCase()) ||
    cat.description.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelect = (slug: string) => {
    onSelect(slug)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Category</DialogTitle>
          <DialogDescription>
            Choose the category that best describes your experience
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {filteredCategories.map((category, index) => (
            <motion.div
              key={category.slug}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.02 }}
            >
              <Button
                variant={currentCategory === category.slug ? 'default' : 'outline'}
                onClick={() => handleSelect(category.slug)}
                className="h-auto flex-col items-start p-4 w-full text-left"
              >
                <div className="text-2xl mb-2">{category.emoji}</div>
                <div className="font-semibold text-sm mb-1">{category.label}</div>
                <div className="text-xs text-muted-foreground opacity-80">
                  {category.description}
                </div>
              </Button>
            </motion.div>
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No categories found
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
