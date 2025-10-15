'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Bell, BellOff, Trash2, Play, Edit2, Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface SavedSearch {
  id: string
  name: string
  query: string
  search_type: string
  filters: any
  is_alert_enabled: boolean
  alert_frequency: 'immediate' | 'daily' | 'weekly' | null
  last_alert_sent_at: string | null
  created_at: string
}

interface SavedSearchesManagerProps {
  onExecuteSearch?: (search: SavedSearch) => void
}

export function SavedSearchesManager({ onExecuteSearch }: SavedSearchesManagerProps) {
  const [searches, setSearches] = useState<SavedSearch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [editingSearch, setEditingSearch] = useState<SavedSearch | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const { toast } = useToast()

  // Form state
  const [formName, setFormName] = useState('')
  const [formQuery, setFormQuery] = useState('')
  const [formAlertEnabled, setFormAlertEnabled] = useState(false)
  const [formAlertFrequency, setFormAlertFrequency] = useState<'immediate' | 'daily' | 'weekly'>('daily')

  useEffect(() => {
    fetchSavedSearches()
  }, [])

  async function fetchSavedSearches() {
    try {
      const response = await fetch('/api/saved-searches')
      if (!response.ok) throw new Error('Failed to fetch saved searches')

      const data = await response.json()
      setSearches(data.savedSearches || [])
    } catch (error) {
      console.error('Error fetching saved searches:', error)
      toast({
        title: 'Error',
        description: 'Failed to load saved searches',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function toggleAlert(search: SavedSearch) {
    try {
      const response = await fetch(`/api/saved-searches/${search.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isAlertEnabled: !search.is_alert_enabled,
          alertFrequency: !search.is_alert_enabled ? 'daily' : search.alert_frequency,
        }),
      })

      if (!response.ok) throw new Error('Failed to update alert')

      await fetchSavedSearches()
      toast({
        title: 'Success',
        description: `Alerts ${!search.is_alert_enabled ? 'enabled' : 'disabled'}`,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update alert settings',
        variant: 'destructive',
      })
    }
  }

  async function updateAlertFrequency(searchId: string, frequency: 'immediate' | 'daily' | 'weekly') {
    try {
      const response = await fetch(`/api/saved-searches/${searchId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alertFrequency: frequency,
        }),
      })

      if (!response.ok) throw new Error('Failed to update frequency')

      await fetchSavedSearches()
      toast({
        title: 'Success',
        description: 'Alert frequency updated',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update frequency',
        variant: 'destructive',
      })
    }
  }

  async function deleteSearch(searchId: string) {
    if (!confirm('Are you sure you want to delete this saved search?')) return

    try {
      const response = await fetch(`/api/saved-searches/${searchId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete search')

      await fetchSavedSearches()
      toast({
        title: 'Success',
        description: 'Saved search deleted',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete search',
        variant: 'destructive',
      })
    }
  }

  async function executeSearch(search: SavedSearch) {
    try {
      const response = await fetch(`/api/saved-searches/${search.id}/execute`, {
        method: 'POST',
      })

      if (!response.ok) throw new Error('Search execution failed')

      const data = await response.json()
      toast({
        title: 'Search Executed',
        description: `Found ${data.results?.length || 0} results`,
      })

      if (onExecuteSearch) {
        onExecuteSearch(search)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to execute search',
        variant: 'destructive',
      })
    }
  }

  async function saveSearch() {
    if (!formName.trim() || !formQuery.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Name and query are required',
        variant: 'destructive',
      })
      return
    }

    setIsSaving(true)

    try {
      const url = editingSearch
        ? `/api/saved-searches/${editingSearch.id}`
        : '/api/saved-searches'

      const response = await fetch(url, {
        method: editingSearch ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          query: formQuery,
          searchType: 'hybrid',
          isAlertEnabled: formAlertEnabled,
          alertFrequency: formAlertEnabled ? formAlertFrequency : null,
        }),
      })

      if (!response.ok) throw new Error('Failed to save search')

      await fetchSavedSearches()
      setIsCreateDialogOpen(false)
      setEditingSearch(null)
      resetForm()

      toast({
        title: 'Success',
        description: editingSearch ? 'Search updated' : 'Search saved',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save search',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  function resetForm() {
    setFormName('')
    setFormQuery('')
    setFormAlertEnabled(false)
    setFormAlertFrequency('daily')
  }

  function openEditDialog(search: SavedSearch) {
    setEditingSearch(search)
    setFormName(search.name)
    setFormQuery(search.query)
    setFormAlertEnabled(search.is_alert_enabled)
    setFormAlertFrequency(search.alert_frequency || 'daily')
    setIsCreateDialogOpen(true)
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Saved Searches</h3>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingSearch(null); resetForm(); }}>
              <Plus className="w-4 h-4 mr-2" />
              New Search
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingSearch ? 'Edit' : 'Save'} Search</DialogTitle>
              <DialogDescription>
                {editingSearch ? 'Update' : 'Create'} a saved search with optional alerts
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g., UFO Bodensee"
                />
              </div>

              <div>
                <Label htmlFor="query">Query</Label>
                <Input
                  id="query"
                  value={formQuery}
                  onChange={(e) => setFormQuery(e.target.value)}
                  placeholder="Enter search terms"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Alerts</Label>
                  <p className="text-xs text-muted-foreground">
                    Get notified when new matches appear
                  </p>
                </div>
                <Switch
                  checked={formAlertEnabled}
                  onCheckedChange={setFormAlertEnabled}
                />
              </div>

              {formAlertEnabled && (
                <div>
                  <Label>Alert Frequency</Label>
                  <Select
                    value={formAlertFrequency}
                    onValueChange={(val: any) => setFormAlertFrequency(val)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveSearch} disabled={isSaving}>
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingSearch ? 'Update' : 'Save'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {searches.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>No saved searches yet</p>
            <p className="text-sm mt-1">Create one to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {searches.map((search) => (
            <Card key={search.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium truncate">{search.name}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {search.search_type}
                      </Badge>
                      {search.is_alert_enabled && (
                        <Badge variant="default" className="text-xs">
                          <Bell className="w-3 h-3 mr-1" />
                          {search.alert_frequency}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{search.query}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => executeSearch(search)}
                      title="Execute search"
                    >
                      <Play className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(search)}
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleAlert(search)}
                      title={search.is_alert_enabled ? 'Disable alerts' : 'Enable alerts'}
                    >
                      {search.is_alert_enabled ? (
                        <Bell className="w-4 h-4 text-primary" />
                      ) : (
                        <BellOff className="w-4 h-4" />
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteSearch(search.id)}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>

                {search.is_alert_enabled && (
                  <div className="mt-3 pt-3 border-t flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Alert frequency:</span>
                    <Select
                      value={search.alert_frequency || 'daily'}
                      onValueChange={(val: any) => updateAlertFrequency(search.id, val)}
                    >
                      <SelectTrigger className="w-32 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
