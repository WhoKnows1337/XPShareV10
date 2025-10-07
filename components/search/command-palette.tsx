'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import {
  Search,
  Sparkles,
  Clock,
  Hash,
  Map,
  User,
  Settings,
  FileText,
  TrendingUp
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

interface Experience {
  id: string
  title: string
  category: string
  location_city?: string
  user_id: string
  user_profiles?: {
    username: string
    display_name?: string
  }
}

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState<Experience[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  // Load recent searches from localStorage
  useEffect(() => {
    const recent = localStorage.getItem('recent_searches')
    if (recent) {
      setRecentSearches(JSON.parse(recent))
    }
  }, [])

  // Save recent search
  const saveRecentSearch = useCallback((query: string) => {
    if (!query.trim()) return

    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('recent_searches', JSON.stringify(updated))
  }, [recentSearches])

  // Instant search with debouncing
  useEffect(() => {
    if (!search.trim()) {
      setSearchResults([])
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('experiences')
          .select(`
            id,
            title,
            category,
            location_city,
            user_id,
            user_profiles!inner(
              username,
              display_name
            )
          `)
          .or(`title.ilike.%${search}%,description.ilike.%${search}%`)
          .eq('visibility', 'public')
          .limit(10)

        if (!error && data) {
          setSearchResults(data)
        }
      } catch (err) {
        console.error('Search error:', err)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [search])

  const categories = [
    { label: 'UFO-Sichtung', value: 'ufo', icon: '🛸' },
    { label: 'Paranormal', value: 'paranormal', icon: '👻' },
    { label: 'Träume', value: 'dreams', icon: '💭' },
    { label: 'Synchronizität', value: 'synchronicity', icon: '🔮' },
    { label: 'Nahtoderfahrung', value: 'nde', icon: '✨' },
    { label: 'OBE', value: 'obe', icon: '🌌' },
  ]

  const handleSelect = (callback: () => void) => {
    callback()
    onOpenChange(false)
    setSearch('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-2xl">
        <VisuallyHidden>
          <DialogTitle>Search experiences, categories, and users</DialogTitle>
        </VisuallyHidden>
        <Command className="rounded-lg border shadow-md">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Suche Erfahrungen, Kategorien, User..."
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <Command.List className="max-h-[400px] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              {loading ? 'Suche...' : 'Keine Ergebnisse gefunden.'}
            </Command.Empty>

            {/* AI-Powered Suggestions */}
            {!search && (
              <Command.Group heading={
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground px-2 py-1.5">
                  <Sparkles className="h-3 w-3" />
                  AI-Vorschläge
                </div>
              }>
                <Command.Item
                  onSelect={() => handleSelect(() => router.push('/feed?view=map'))}
                  className="flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded-sm hover:bg-accent"
                >
                  <Map className="h-4 w-4" />
                  <span>UFO-Hotspots auf Karte entdecken</span>
                </Command.Item>
                <Command.Item
                  onSelect={() => handleSelect(() => router.push('/feed?category=ufo'))}
                  className="flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded-sm hover:bg-accent"
                >
                  <TrendingUp className="h-4 w-4" />
                  <span>Trending: UFO-Erfahrungen</span>
                </Command.Item>
              </Command.Group>
            )}

            {/* Recent Searches */}
            {!search && recentSearches.length > 0 && (
              <Command.Group heading={
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground px-2 py-1.5">
                  <Clock className="h-3 w-3" />
                  Letzte Suchen
                </div>
              }>
                {recentSearches.map((recentSearch, idx) => (
                  <Command.Item
                    key={idx}
                    onSelect={() => {
                      setSearch(recentSearch)
                    }}
                    className="flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded-sm hover:bg-accent"
                  >
                    <Clock className="h-4 w-4 opacity-50" />
                    <span>{recentSearch}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* Categories */}
            {!search && (
              <Command.Group heading={
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground px-2 py-1.5">
                  <Hash className="h-3 w-3" />
                  Kategorien
                </div>
              }>
                {categories.map((cat) => (
                  <Command.Item
                    key={cat.value}
                    onSelect={() => handleSelect(() => {
                      router.push(`/categories/${cat.value}`)
                      saveRecentSearch(cat.label)
                    })}
                    className="flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded-sm hover:bg-accent"
                  >
                    <span className="text-lg">{cat.icon}</span>
                    <span>{cat.label}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* Search Results */}
            {search && searchResults.length > 0 && (
              <Command.Group heading={
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground px-2 py-1.5">
                  <FileText className="h-3 w-3" />
                  Erfahrungen
                </div>
              }>
                {searchResults.map((exp) => (
                  <Command.Item
                    key={exp.id}
                    onSelect={() => handleSelect(() => {
                      router.push(`/experience/${exp.id}`)
                      saveRecentSearch(exp.title)
                    })}
                    className="flex items-center gap-3 px-2 py-2 cursor-pointer rounded-sm hover:bg-accent"
                  >
                    <div className="flex flex-col gap-1 flex-1">
                      <div className="font-medium">{exp.title}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <span className="capitalize">{exp.category}</span>
                        {exp.location_city && (
                          <>
                            <span>•</span>
                            <span>{exp.location_city}</span>
                          </>
                        )}
                        {exp.user_profiles && (
                          <>
                            <span>•</span>
                            <User className="h-3 w-3 inline" />
                            <span>{exp.user_profiles.display_name || exp.user_profiles.username}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* Quick Actions */}
            {!search && (
              <Command.Group heading={
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground px-2 py-1.5">
                  <Settings className="h-3 w-3" />
                  Schnellzugriff
                </div>
              }>
                <Command.Item
                  onSelect={() => handleSelect(() => router.push('/submit'))}
                  className="flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded-sm hover:bg-accent"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Neue Erfahrung teilen</span>
                </Command.Item>
                <Command.Item
                  onSelect={() => handleSelect(() => router.push('/profile'))}
                  className="flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded-sm hover:bg-accent"
                >
                  <User className="h-4 w-4" />
                  <span>Mein Profil</span>
                </Command.Item>
              </Command.Group>
            )}
          </Command.List>

          <div className="border-t px-3 py-2 text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>Tastaturnavigation: ↑↓ Enter Esc</span>
              <span>Cmd+K zum Öffnen</span>
            </div>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
