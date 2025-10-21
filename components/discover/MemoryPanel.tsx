/**
 * Memory Panel Component
 *
 * Displays and manages user preferences and session context.
 * Allows users to view, edit, and delete their stored preferences.
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Brain, Trash2, RefreshCw } from 'lucide-react'
import { UserPreferences, SessionContext, MemoryManager } from '@/lib/memory/manager'

export interface MemoryPanelProps {
  memoryManager: MemoryManager
  sessionId?: string
}

export function MemoryPanel({ memoryManager, sessionId }: MemoryPanelProps) {
  const [preferences, setPreferences] = useState<UserPreferences>({})
  const [sessionContext, setSessionContext] = useState<SessionContext>({})
  const [loading, setLoading] = useState(true)

  // Load preferences and session context
  useEffect(() => {
    loadData()
  }, [memoryManager, sessionId])

  async function loadData() {
    setLoading(true)
    try {
      const prefs = await memoryManager.getUserPreferences()
      setPreferences(prefs)

      if (sessionId) {
        const context = await memoryManager.getSessionContext(sessionId)
        setSessionContext(context)
      }
    } catch (error) {
      console.error('Failed to load memory data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function updatePreference<K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) {
    const success = await memoryManager.setUserPreference(key, value)
    if (success) {
      setPreferences((prev) => ({ ...prev, [key]: value }))
    }
  }

  async function clearSession() {
    if (!sessionId) return

    const confirmed = confirm('Clear session context? This will reset conversation memory.')
    if (!confirmed) return

    const success = await memoryManager.clearSession(sessionId)
    if (success) {
      setSessionContext({})
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            <CardTitle>Memory</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* User Preferences */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              <CardTitle>Preferences</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={loadData}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>Your personalization settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Auto-suggest */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-suggest">Auto-Suggest</Label>
              <p className="text-xs text-muted-foreground">
                Show intelligent follow-up suggestions
              </p>
            </div>
            <Switch
              id="auto-suggest"
              checked={preferences.autoSuggestEnabled ?? true}
              onCheckedChange={(checked) => updatePreference('autoSuggestEnabled', checked)}
            />
          </div>

          {/* Notifications */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications">Notifications</Label>
              <p className="text-xs text-muted-foreground">
                Get notified of new insights
              </p>
            </div>
            <Switch
              id="notifications"
              checked={preferences.notificationsEnabled ?? false}
              onCheckedChange={(checked) => updatePreference('notificationsEnabled', checked)}
            />
          </div>

          {/* Preferred Categories */}
          {preferences.preferredCategories && preferences.preferredCategories.length > 0 && (
            <div>
              <Label>Preferred Categories</Label>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {preferences.preferredCategories.map((category) => (
                  <Badge key={category} variant="secondary">
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Default View */}
          {preferences.defaultView && (
            <div>
              <Label>Default View</Label>
              <div className="mt-2">
                <Badge variant="outline">{preferences.defaultView}</Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session Context */}
      {sessionId && Object.keys(sessionContext).length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Session Context</CardTitle>
                <CardDescription>Temporary conversation memory</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={clearSession}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Conversation Topic */}
            {sessionContext.conversationTopic && (
              <div>
                <Label>Topic</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {sessionContext.conversationTopic}
                </p>
              </div>
            )}

            {/* Recent Queries */}
            {sessionContext.recentQueries && sessionContext.recentQueries.length > 0 && (
              <div>
                <Label>Recent Queries</Label>
                <div className="mt-2 space-y-1">
                  {sessionContext.recentQueries.slice(0, 3).map((query, i) => (
                    <p key={i} className="text-xs text-muted-foreground line-clamp-1">
                      • {query}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Active Filters */}
            {sessionContext.activeFilters && Object.keys(sessionContext.activeFilters).length > 0 && (
              <div>
                <Label>Active Filters</Label>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {Object.entries(sessionContext.activeFilters).map(([key, value]) => (
                    <Badge key={key} variant="outline" className="text-xs">
                      {key}: {String(value)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

/**
 * Compact version for sidebar
 */
export function CompactMemoryPanel({ memoryManager }: { memoryManager: MemoryManager }) {
  const [preferences, setPreferences] = useState<UserPreferences>({})

  useEffect(() => {
    memoryManager.getUserPreferences().then(setPreferences)
  }, [memoryManager])

  const enabledFeatures = [
    preferences.autoSuggestEnabled && 'Suggestions',
    preferences.notificationsEnabled && 'Notifications',
  ].filter(Boolean)

  if (enabledFeatures.length === 0) return null

  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Brain className="h-3.5 w-3.5" />
      <span>{enabledFeatures.join(', ')}</span>
    </div>
  )
}
