import { Metadata } from 'next'
import { AskAIStructured } from '@/components/search/ask-ai-structured'

export const metadata: Metadata = {
  title: 'Ask AI - Pattern Discovery | XP-Share',
  description: 'Discover patterns in extraordinary experiences using AI-powered pattern analysis',
}

export default function AskAIPage() {
  return (
    <div className="container max-w-7xl py-8">
      {/* Skip to content for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
      >
        Skip to main content
      </a>

      {/* Header */}
      <div className="mb-8 text-center space-y-3">
        <h1 className="text-4xl font-bold tracking-tight">
          Pattern Discovery
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Ask questions about extraordinary experiences and discover hidden patterns
          using AI-powered pattern analysis
        </p>
      </div>

      {/* Main Search Interface */}
      <main id="main-content">
        <AskAIStructured />
      </main>

      {/* Info Section */}
      <div className="mt-16 border-t pt-8">
        <div className="grid md:grid-cols-3 gap-6 text-sm">
          <div className="space-y-2">
            <h3 className="font-semibold">🔍 Pattern Types</h3>
            <p className="text-muted-foreground">
              Discover color patterns, temporal trends, behavioral patterns,
              geographic clusters, and attribute correlations
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">💬 Multi-Turn Dialogue</h3>
            <p className="text-muted-foreground">
              Ask follow-up questions to refine your search and explore
              patterns more deeply with context-aware responses
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">✨ Serendipity</h3>
            <p className="text-muted-foreground">
              Discover unexpected cross-category patterns and surprising
              connections between different types of experiences
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
