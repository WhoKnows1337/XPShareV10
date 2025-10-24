/**
 * Agent Network v3 Test Page
 *
 * Demo page for testing Mastra Agent Network with Claude 3.7 Sonnet Extended Thinking
 */

import { AgentNetworkChat } from '@/components/discover/AgentNetworkChat'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Brain, Zap, TrendingUp, Sparkles } from 'lucide-react'

export default function TestNetworkPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Brain className="w-8 h-8 text-purple-500" />
            <h1 className="text-4xl font-bold">Agent Network v3</h1>
            <Sparkles className="w-8 h-8 text-purple-500" />
          </div>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Test the new Mastra Agent Network with Claude 3.7 Sonnet Extended Thinking. Watch the
            AI think, choose tools, and reason through complex queries in real-time.
          </p>

          {/* Feature Badges */}
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Brain className="w-3 h-3" />
              Extended Thinking
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Zap className="w-3 h-3" />
              Adaptive Complexity
            </Badge>
            <Badge variant="outline" className="gap-1">
              <TrendingUp className="w-3 h-3" />
              Autonomous Tool Selection
            </Badge>
          </div>
        </div>

        {/* Chat Component */}
        <AgentNetworkChat className="mx-auto max-w-4xl" />

        {/* Example Queries */}
        <Card className="p-6 max-w-4xl mx-auto">
          <h2 className="text-lg font-semibold mb-4">💡 Try these example queries:</h2>

          <div className="grid gap-3">
            <ExampleQuery
              complexity="low"
              query="Show me UFO sightings from Berlin"
              expectedMode="Standard (3s)"
              expectedTools={['advancedSearch or geoSearch']}
            />

            <ExampleQuery
              complexity="medium"
              query="Compare dream experiences in Berlin vs Paris and show on a map"
              expectedMode="Extended (10s)"
              expectedTools={['advancedSearch', 'compareCategories', 'generateMap']}
            />

            <ExampleQuery
              complexity="high"
              query="Analyze temporal patterns in psychic experiences, detect correlations with moon phases, and predict next month's trends"
              expectedMode="Extended (10s) or o3-mini (15s)"
              expectedTools={['detectPatterns', 'attributeCorrelation', 'predictTrends']}
            />

            <ExampleQuery
              complexity="low"
              query="Who are the top 10 contributors?"
              expectedMode="Standard (3s)"
              expectedTools={['rankUsers']}
            />

            <ExampleQuery
              complexity="medium"
              query="Find connections between UFO sightings and show them as a network graph"
              expectedMode="Extended (10s)"
              expectedTools={['findConnections', 'generateNetwork']}
            />
          </div>
        </Card>

        {/* Technical Info */}
        <Card className="p-6 max-w-4xl mx-auto bg-muted/50">
          <h3 className="text-sm font-semibold mb-3">🔧 Technical Details</h3>

          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">API Endpoint</h4>
              <code className="text-xs bg-background px-2 py-1 rounded">/api/discover-v3</code>
            </div>

            <div>
              <h4 className="font-medium mb-2">Model</h4>
              <p className="text-muted-foreground">Claude 3.7 Sonnet (Extended Thinking)</p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Streaming</h4>
              <p className="text-muted-foreground">Server-Sent Events (SSE)</p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Memory</h4>
              <p className="text-muted-foreground">Thread-based (PostgreSQL)</p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Available Tools</h4>
              <p className="text-muted-foreground">15 specialized tools (Search, Analytics, Viz)</p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Complexity Analysis</h4>
              <p className="text-muted-foreground">Automatic (0-100% score)</p>
            </div>
          </div>
        </Card>

        {/* Thinking Mode Comparison */}
        <Card className="p-6 max-w-4xl mx-auto">
          <h3 className="text-sm font-semibold mb-3">⚡ Thinking Modes</h3>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Badge variant="secondary">Standard Mode</Badge>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• ~3s latency</li>
                <li>• $0.008/query</li>
                <li>• Simple queries</li>
                <li>• Single-tool tasks</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Badge variant="default">Extended Mode</Badge>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• ~10s latency</li>
                <li>• $0.018/query</li>
                <li>• Complex queries</li>
                <li>• Multi-tool orchestration</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Badge variant="outline">o3-mini (Premium)</Badge>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• ~15s latency</li>
                <li>• $0.028/query</li>
                <li>• Ultra-complex</li>
                <li>• Deep analysis</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

interface ExampleQueryProps {
  complexity: 'low' | 'medium' | 'high'
  query: string
  expectedMode: string
  expectedTools: string[]
}

function ExampleQuery({ complexity, query, expectedMode, expectedTools }: ExampleQueryProps) {
  const complexityColors = {
    low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  }

  return (
    <div className="p-3 rounded-lg border bg-card space-y-2">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium flex-1">"{query}"</p>
        <Badge variant="outline" className={complexityColors[complexity]}>
          {complexity}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span>
          <strong>Mode:</strong> {expectedMode}
        </span>
        <span>•</span>
        <span>
          <strong>Tools:</strong> {expectedTools.join(', ')}
        </span>
      </div>
    </div>
  )
}
