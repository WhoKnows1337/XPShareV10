'use client'

/**
 * User Preferences Management Page
 *
 * Allows users to view, edit, and delete their stored preferences/memories.
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Brain,
  Heart,
  HeartCrack,
  Info,
  Trash2,
  Plus,
  TrendingUp,
  Search,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

interface UserMemory {
  id: string
  scope: 'preference' | 'fact' | 'context' | 'dislike'
  key: string
  value: any
  confidence: number
  source?: string
  createdAt: string
  updatedAt: string
}

export default function PreferencesPage() {
  const [memories, setMemories] = useState<UserMemory[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | UserMemory['scope']>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadMemories()
  }, [])

  async function loadMemories() {
    try {
      setLoading(true)
      const res = await fetch('/api/memories')
      if (res.ok) {
        const data = await res.json()
        setMemories(data.memories || [])
      }
    } catch (error) {
      console.error('Failed to load memories:', error)
      toast.error('Failed to load preferences')
    } finally {
      setLoading(false)
    }
  }

  async function deleteMemory(memoryId: string) {
    try {
      const res = await fetch(`/api/memories/${memoryId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setMemories(memories.filter((m) => m.id !== memoryId))
        toast.success('Memory deleted')
      } else {
        toast.error('Failed to delete memory')
      }
    } catch (error) {
      console.error('Failed to delete memory:', error)
      toast.error('Failed to delete memory')
    }
  }

  async function addMemory(memory: Omit<UserMemory, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const res = await fetch('/api/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memory),
      })

      if (res.ok) {
        const data = await res.json()
        setMemories([data.memory, ...memories])
        toast.success('Memory saved')
      } else {
        toast.error('Failed to save memory')
      }
    } catch (error) {
      console.error('Failed to save memory:', error)
      toast.error('Failed to save memory')
    }
  }

  const filteredMemories = memories
    .filter((m) => filter === 'all' || m.scope === filter)
    .filter((m) =>
      searchQuery === '' ||
      m.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(m.value).toLowerCase().includes(searchQuery.toLowerCase())
    )

  const groupedMemories = {
    preference: filteredMemories.filter((m) => m.scope === 'preference'),
    dislike: filteredMemories.filter((m) => m.scope === 'dislike'),
    fact: filteredMemories.filter((m) => m.scope === 'fact'),
    context: filteredMemories.filter((m) => m.scope === 'context'),
  }

  return (
    <div className="container max-w-5xl py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Brain className="h-8 w-8" />
          My Preferences & Memory
        </h1>
        <p className="text-muted-foreground">
          The AI learns your preferences over time. Manage what it remembers about you.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{groupedMemories.preference.length}</div>
            <p className="text-xs text-muted-foreground">Preferences</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{groupedMemories.dislike.length}</div>
            <p className="text-xs text-muted-foreground">Dislikes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{groupedMemories.fact.length}</div>
            <p className="text-xs text-muted-foreground">Facts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{groupedMemories.context.length}</div>
            <p className="text-xs text-muted-foreground">Context</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search memories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="preference">Preferences</SelectItem>
            <SelectItem value="dislike">Dislikes</SelectItem>
            <SelectItem value="fact">Facts</SelectItem>
            <SelectItem value="context">Context</SelectItem>
          </SelectContent>
        </Select>
        <AddMemoryDialog onAdd={addMemory} />
      </div>

      {/* Memory List */}
      {loading ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Loading preferences...
          </CardContent>
        </Card>
      ) : filteredMemories.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {searchQuery ? 'No memories found matching your search.' : 'No memories yet. Chat with the AI to build your preference profile!'}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedMemories).map(([scope, mems]) => {
            if (mems.length === 0 && filter !== 'all' && filter !== scope) return null
            if (mems.length === 0) return null

            return (
              <Card key={scope}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {getScopeIcon(scope as UserMemory['scope'])}
                    {getScopeTitle(scope as UserMemory['scope'])}
                    <Badge variant="secondary">{mems.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mems.map((memory) => (
                    <div
                      key={memory.id}
                      className="flex items-start justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 space-y-1">
                        <div className="font-medium">{formatKey(memory.key)}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatValue(memory.value)}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline" className="h-5">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            {Math.round(memory.confidence * 100)}% confidence
                          </Badge>
                          {memory.source && (
                            <span>via {memory.source}</span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMemory(memory.id)}
                        className="shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

function AddMemoryDialog({ onAdd }: { onAdd: (memory: any) => void }) {
  const [open, setOpen] = useState(false)
  const [scope, setScope] = useState<UserMemory['scope']>('preference')
  const [key, setKey] = useState('')
  const [value, setValue] = useState('')

  function handleAdd() {
    if (!key || !value) {
      toast.error('Please fill in all fields')
      return
    }

    onAdd({
      scope,
      key: key.toLowerCase().replace(/\s+/g, '_'),
      value,
      confidence: 1.0,
      source: 'manual',
    })

    setKey('')
    setValue('')
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Memory
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Memory</DialogTitle>
          <DialogDescription>
            Manually add a preference, dislike, or fact about yourself.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={scope} onValueChange={(v) => setScope(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="preference">Preference (I like...)</SelectItem>
                <SelectItem value="dislike">Dislike (I don't want...)</SelectItem>
                <SelectItem value="fact">Fact (About me)</SelectItem>
                <SelectItem value="context">Context (Background info)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Key</Label>
            <Input
              placeholder="e.g., filter_drug_experiences"
              value={key}
              onChange={(e) => setKey(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Value</Label>
            <Input
              placeholder="e.g., Exclude experiences involving drugs"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAdd}>Add Memory</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function getScopeIcon(scope: UserMemory['scope']) {
  const icons = {
    preference: <Heart className="h-5 w-5 text-green-500" />,
    dislike: <HeartCrack className="h-5 w-5 text-red-500" />,
    fact: <Info className="h-5 w-5 text-blue-500" />,
    context: <Brain className="h-5 w-5 text-purple-500" />,
  }
  return icons[scope]
}

function getScopeTitle(scope: UserMemory['scope']) {
  const titles = {
    preference: 'Preferences',
    dislike: 'Dislikes',
    fact: 'Facts',
    context: 'Context',
  }
  return titles[scope]
}

function formatKey(key: string): string {
  return key
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function formatValue(value: any): string {
  if (typeof value === 'string') return value
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'number') return value.toString()
  if (Array.isArray(value)) return value.join(', ')
  return JSON.stringify(value)
}
