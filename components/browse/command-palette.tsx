'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import {
  Search,
  TrendingUp,
  MapPin,
  Calendar,
  Tag,
  Sparkles,
  Clock,
} from 'lucide-react'

const categories = [
  { slug: 'ufo', name: '🛸 UFO Sichtungen', icon: '🛸' },
  { slug: 'paranormal', name: '👻 Paranormal', icon: '👻' },
  { slug: 'dreams', name: '💭 Träume', icon: '💭' },
  { slug: 'psychedelic', name: '🍄 Psychedelic', icon: '🍄' },
  { slug: 'spiritual', name: '🙏 Spiritual', icon: '🙏' },
  { slug: 'synchronicity', name: '🔮 Synchronicity', icon: '🔮' },
  { slug: 'nde', name: '💫 Near-Death', icon: '💫' },
  { slug: 'other', name: '📦 Other', icon: '📦' },
]

const suggestions = [
  { label: '🔥 Bodensee + Solar-Sturm', query: 'bodensee solar', type: 'trending' },
  { label: '🔥 Nähe + Diese Woche', query: 'nearby week', type: 'trending' },
  { label: '⭐ Verified Experiences', query: 'verified', type: 'filter' },
  { label: '📸 With Images', query: 'images', type: 'filter' },
]

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const router = useRouter()

  // Load recent searches from localStorage
  useEffect(() => {
    const recent = localStorage.getItem('recentSearches')
    if (recent) {
      setRecentSearches(JSON.parse(recent))
    }
  }, [])

  // Save search to recent searches
  const saveSearch = (query: string) => {
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }

  // Handle keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const handleSelect = (value: string, type: 'category' | 'search' | 'suggestion') => {
    if (type === 'category') {
      router.push(`/feed?category=${value}`)
    } else if (type === 'search') {
      saveSearch(value)
      router.push(`/search?q=${encodeURIComponent(value)}`)
    } else if (type === 'suggestion') {
      saveSearch(value)
      router.push(`/search?q=${encodeURIComponent(value)}`)
    }
    setOpen(false)
    setSearch('')
  }

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground bg-muted rounded-lg hover:bg-accent transition-colors w-full max-w-xs"
      >
        <Search className="h-4 w-4" />
        <span>Search experiences...</span>
        <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      {/* Command Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden p-0 shadow-lg max-w-2xl">
          <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <Command.Input
                value={search}
                onValueChange={setSearch}
                placeholder="Search experiences, categories, tags..."
                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <Command.List className="max-h-[400px] overflow-y-auto overflow-x-hidden">
              <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                No results found.
              </Command.Empty>

              {/* Categories */}
              {!search && (
                <Command.Group heading="Categories">
                  {categories.map((category) => (
                    <Command.Item
                      key={category.slug}
                      value={category.slug}
                      onSelect={() => handleSelect(category.slug, 'category')}
                      className="flex items-center gap-2 px-2 py-2 cursor-pointer hover:bg-accent rounded-sm"
                    >
                      <span className="text-lg">{category.icon}</span>
                      <span>{category.name.split(' ').slice(1).join(' ')}</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {/* AI Suggestions */}
              {!search && (
                <Command.Group heading="Suggestions (AI-powered)">
                  {suggestions.map((suggestion, index) => (
                    <Command.Item
                      key={index}
                      value={suggestion.query}
                      onSelect={() => handleSelect(suggestion.query, 'suggestion')}
                      className="flex items-center gap-2 px-2 py-2 cursor-pointer hover:bg-accent rounded-sm"
                    >
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span>{suggestion.label}</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {/* Recent Searches */}
              {!search && recentSearches.length > 0 && (
                <Command.Group heading="Recent Searches">
                  {recentSearches.map((recent, index) => (
                    <Command.Item
                      key={index}
                      value={recent}
                      onSelect={() => handleSelect(recent, 'search')}
                      className="flex items-center gap-2 px-2 py-2 cursor-pointer hover:bg-accent rounded-sm"
                    >
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{recent}</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {/* Search Results */}
              {search && (
                <Command.Group heading="Search">
                  <Command.Item
                    value={search}
                    onSelect={() => handleSelect(search, 'search')}
                    className="flex items-center gap-2 px-2 py-2 cursor-pointer hover:bg-accent rounded-sm"
                  >
                    <Search className="h-4 w-4" />
                    <span>Search for "{search}"</span>
                  </Command.Item>
                </Command.Group>
              )}
            </Command.List>

            {/* Footer */}
            <div className="border-t px-3 py-2 text-xs text-muted-foreground flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
                    ↑↓
                  </kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
                    Enter
                  </kbd>
                  Select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
                    Esc
                  </kbd>
                  Close
                </span>
              </div>
            </div>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  )
}
