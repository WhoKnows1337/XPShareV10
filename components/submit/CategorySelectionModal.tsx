'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Search, Check } from 'lucide-react'
import { type Category } from './CategoryChips'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CategorySelectionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selected?: string
  onSelect: (value: string) => void
  categories: Category[]
}

// Extended category descriptions
const categoryDescriptions: Record<string, string> = {
  ufo: 'Beobachtungen von unidentifizierten Flugobjekten, Lichtern am Himmel oder ungewöhnlichen Phänomenen',
  paranormal: 'Geistererscheinungen, Poltergeist-Aktivitäten oder andere übernatürliche Begegnungen',
  dreams: 'Luzide Träume, Albträume, wiederkehrende oder prophetische Träume',
  psychedelic: 'Erfahrungen mit bewusstseinserweiternden Substanzen und tiefe Einsichten',
  spiritual: 'Spirituelle Erweckungen, Meditationserfahrungen, Visionen oder Energie-Wahrnehmungen',
  synchronicity: 'Bedeutungsvolle Zufälle, Zahlen-Synchronizitäten oder Zeichen aus dem Universum',
  nde: 'Nahtoderfahrungen mit Tunnel, Licht, Lebensrückblick oder Begegnungen mit Wesen',
  other: 'Alle anderen unerklärlichen oder außergewöhnlichen Erfahrungen',
}

export function CategorySelectionModal({
  open,
  onOpenChange,
  selected,
  onSelect,
  categories,
}: CategorySelectionModalProps) {
  const [search, setSearch] = useState('')

  const filteredCategories = categories.filter(
    (cat) =>
      cat.label.toLowerCase().includes(search.toLowerCase()) ||
      categoryDescriptions[cat.value]?.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelect = (value: string) => {
    onSelect(value)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">Wähle deine Kategorie</DialogTitle>
          <DialogDescription>
            Finde die passende Kategorie für deine Erfahrung
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Kategorie suchen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Categories Grid */}
        <div className="flex-1 overflow-y-auto pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <AnimatePresence mode="popLayout">
              {filteredCategories.map((category, index) => {
                const isSelected = selected === category.value

                return (
                  <motion.div
                    key={category.value}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <button
                      onClick={() => handleSelect(category.value)}
                      className={cn(
                        'w-full p-4 rounded-lg border-2 text-left transition-all hover:shadow-md',
                        'relative group',
                        isSelected
                          ? 'border-primary bg-primary/5 shadow-md'
                          : 'border-muted hover:border-primary/50'
                      )}
                    >
                      {/* Selection Check */}
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-3 right-3"
                        >
                          <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                            <Check className="h-4 w-4 text-primary-foreground" />
                          </div>
                        </motion.div>
                      )}

                      {/* Category Header */}
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className={cn(
                            'h-12 w-12 rounded-full flex items-center justify-center text-2xl bg-gradient-to-br',
                            category.color
                          )}
                        >
                          {category.emoji}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{category.label}</h3>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {categoryDescriptions[category.value]}
                      </p>

                      {/* Hover gradient overlay */}
                      {!isSelected && (
                        <div
                          className={cn(
                            'absolute inset-0 rounded-lg opacity-0 group-hover:opacity-5 transition-opacity bg-gradient-to-br pointer-events-none',
                            category.color
                          )}
                        />
                      )}
                    </button>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>

          {/* No Results */}
          {filteredCategories.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>Keine Kategorien gefunden</p>
              <Button
                variant="link"
                onClick={() => setSearch('')}
                className="mt-2"
              >
                Filter zurücksetzen
              </Button>
            </div>
          )}
        </div>

        {/* Footer Stats */}
        <div className="border-t pt-4 text-center text-sm text-muted-foreground">
          {filteredCategories.length} von {categories.length} Kategorien
        </div>
      </DialogContent>
    </Dialog>
  )
}
