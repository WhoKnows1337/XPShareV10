'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MoreHorizontal } from 'lucide-react'
import { motion } from 'framer-motion'
import { CategorySelectionModal } from './CategorySelectionModal'

export interface Category {
  id?: string
  value: string
  label: string
  emoji: string
  color: string
}

// Default fallback categories (used if API fails)
const defaultCategories: Category[] = [
  { value: 'ufo-sighting', label: 'UFO Sichtung', emoji: '🛸', color: 'from-blue-500 to-cyan-500' },
  { value: 'paranormal-activity', label: 'Paranormal', emoji: '👻', color: 'from-purple-500 to-pink-500' },
  { value: 'synchronicity', label: 'Synchronizität', emoji: '✨', color: 'from-teal-500 to-emerald-500' },
  { value: 'other', label: 'Andere', emoji: '❓', color: 'from-gray-500 to-slate-500' },
]

interface CategoryChipsProps {
  selected?: string
  onSelect: (value: string) => void
  className?: string
}

export function CategoryChips({ selected, onSelect, className }: CategoryChipsProps) {
  const [showModal, setShowModal] = useState(false)
  const [categories, setCategories] = useState<Category[]>(defaultCategories)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch categories from API
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        if (response.ok) {
          const data = await response.json()
          const mappedCategories = data.categories.map((cat: any) => ({
            id: cat.id,
            value: cat.slug,
            label: cat.name,
            emoji: cat.emoji || '📌',
            color: cat.color || 'from-gray-500 to-slate-500',
          }))
          setCategories(mappedCategories)
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error)
        // Keep default categories on error
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  // Show first 4 categories + "Mehr" button
  const visibleCategories = categories.slice(0, 4)

  return (
    <>
      <div className={cn('flex flex-wrap gap-3', className)}>
        {visibleCategories.map((category, index) => {
          const isSelected = selected === category.value

          return (
            <motion.button
              key={category.value}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelect(category.value)}
              className={cn(
                'group relative px-4 py-2.5 rounded-full border-2 transition-all duration-200',
                'hover:scale-105 hover:shadow-md',
                isSelected
                  ? 'border-primary bg-primary text-primary-foreground shadow-lg'
                  : 'border-muted-foreground/20 bg-background hover:border-primary/50'
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{category.emoji}</span>
                <span className="font-medium text-sm">{category.label}</span>
              </div>

              {/* Gradient overlay on hover */}
              {!isSelected && (
                <div
                  className={cn(
                    'absolute inset-0 rounded-full opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-r',
                    category.color
                  )}
                />
              )}
            </motion.button>
          )
        })}

      {/* Mehr Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Button
          variant="outline"
          onClick={() => setShowModal(true)}
          className="rounded-full px-4 py-2.5 h-auto border-2 hover:border-primary/50"
        >
          <MoreHorizontal className="h-4 w-4 mr-2" />
          <span className="font-medium text-sm">Mehr...</span>
        </Button>
      </motion.div>
    </div>

    {/* Modal */}
    <CategorySelectionModal
      open={showModal}
      onOpenChange={setShowModal}
      selected={selected}
      onSelect={onSelect}
      categories={categories}
    />
    </>
  )
}

// Subcategory chips for selected category
interface SubcategoryOption {
  value: string
  label: string
}

const subcategories: Record<string, SubcategoryOption[]> = {
  ufo: [
    { value: 'lights', label: 'Lichter' },
    { value: 'craft', label: 'Objekt' },
    { value: 'close_encounter', label: 'Nahe Begegnung' },
    { value: 'abduction', label: 'Entführung' },
  ],
  paranormal: [
    { value: 'ghost', label: 'Geist' },
    { value: 'poltergeist', label: 'Poltergeist' },
    { value: 'shadow_figure', label: 'Schattenfigur' },
    { value: 'haunted_location', label: 'Spukort' },
  ],
  dreams: [
    { value: 'lucid', label: 'Luzid' },
    { value: 'nightmare', label: 'Albtraum' },
    { value: 'recurring', label: 'Wiederkehrend' },
    { value: 'prophetic', label: 'Prophetisch' },
  ],
  psychedelic: [
    { value: 'visual', label: 'Visuell' },
    { value: 'entity_contact', label: 'Wesen-Kontakt' },
    { value: 'breakthrough', label: 'Durchbruch' },
    { value: 'healing', label: 'Heilung' },
  ],
  spiritual: [
    { value: 'awakening', label: 'Erwachen' },
    { value: 'meditation', label: 'Meditation' },
    { value: 'vision', label: 'Vision' },
    { value: 'energy', label: 'Energie' },
  ],
  synchronicity: [
    { value: 'numbers', label: 'Zahlen' },
    { value: 'signs', label: 'Zeichen' },
    { value: 'coincidence', label: 'Zufall' },
    { value: 'manifestation', label: 'Manifestation' },
  ],
  nde: [
    { value: 'tunnel', label: 'Tunnel' },
    { value: 'light', label: 'Licht' },
    { value: 'life_review', label: 'Lebensrückblick' },
    { value: 'beings', label: 'Wesen' },
  ],
}

interface SubcategoryChipsProps {
  category: string
  selected?: string
  onSelect: (value: string) => void
  className?: string
}

export function SubcategoryChips({
  category,
  selected,
  onSelect,
  className,
}: SubcategoryChipsProps) {
  const options = subcategories[category] || []

  if (options.length === 0) return null

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {options.map((option, index) => {
        const isSelected = selected === option.value

        return (
          <motion.button
            key={option.value}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelect(option.value)}
            className={cn(
              'px-3 py-1.5 rounded-full border text-sm font-medium transition-all',
              'hover:scale-105',
              isSelected
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-muted-foreground/20 hover:border-primary/50'
            )}
          >
            {option.label}
          </motion.button>
        )
      })}
    </div>
  )
}
