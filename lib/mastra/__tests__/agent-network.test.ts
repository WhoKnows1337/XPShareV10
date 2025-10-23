/**
 * Agent Network Tests
 *
 * Verifies Agent Network routing and multi-agent orchestration
 */

import { describe, test, expect, beforeEach } from 'vitest'
import { mastra } from '../index'
import { createXPShareContext } from '../context'

describe('Agent Network', () => {
  let mockSupabase: any
  let context: any

  beforeEach(() => {
    // Mock Supabase client for testing
    mockSupabase = {
      from: () => ({
        select: () => ({
          eq: () => ({
            order: () => ({
              limit: () => Promise.resolve({ data: [], error: null }),
            }),
          }),
        }),
      }),
      rpc: () => Promise.resolve({ data: [], error: null }),
    } as any

    context = createXPShareContext(mockSupabase, 'test-user-123', 'en')
  })

  test('Mastra instance has Agent Network enabled', () => {
    expect(mastra).toBeDefined()
    // Agent Network is enabled - verify agents are registered
    expect(mastra.getAgent('orchestrator')).toBeDefined()
    expect(mastra.getAgent('query')).toBeDefined()
    expect(mastra.getAgent('viz')).toBeDefined()
    expect(mastra.getAgent('insight')).toBeDefined()
    expect(mastra.getAgent('relationship')).toBeDefined()
  })

  test('Individual agents are accessible', () => {
    const orchestrator = mastra.getAgent('orchestrator')
    const query = mastra.getAgent('query')
    const viz = mastra.getAgent('viz')
    const insight = mastra.getAgent('insight')
    const relationship = mastra.getAgent('relationship')

    expect(orchestrator.name).toBe('orchestrator')
    expect(query.name).toBe('query')
    expect(viz.name).toBe('viz')
    expect(insight.name).toBe('insight')
    expect(relationship.name).toBe('relationship')
  })

  test('Query agent has all 5 search tools', () => {
    const query = mastra.getAgent('query')
    const tools = query.getTools()

    expect(tools).toBeDefined()
    expect(tools.advancedSearch).toBeDefined()
    expect(tools.searchByAttributes).toBeDefined()
    expect(tools.semanticSearch).toBeDefined()
    expect(tools.fullTextSearch).toBeDefined()
    expect(tools.geoSearch).toBeDefined()
  })

  test('Viz agent has temporal analysis tool', () => {
    const viz = mastra.getAgent('viz')
    const tools = viz.getTools()

    expect(tools).toBeDefined()
    expect(tools.temporalAnalysis).toBeDefined()
  })

  test('Insight agent has all 5 insights tools', () => {
    const insight = mastra.getAgent('insight')
    const tools = insight.getTools()

    expect(tools).toBeDefined()
    expect(tools.generateInsights).toBeDefined()
    expect(tools.predictTrends).toBeDefined()
    expect(tools.detectPatterns).toBeDefined()
    expect(tools.suggestFollowups).toBeDefined()
    expect(tools.exportResults).toBeDefined()
  })

  test('Relationship agent has all 6 tools', () => {
    const relationship = mastra.getAgent('relationship')
    const tools = relationship.getTools()

    expect(tools).toBeDefined()
    expect(tools.findConnections).toBeDefined()
    expect(tools.analyzeCategory).toBeDefined()
    expect(tools.compareCategories).toBeDefined()
    expect(tools.attributeCorrelation).toBeDefined()
    expect(tools.rankUsers).toBeDefined()
    expect(tools.detectPatterns).toBeDefined()
  })

  test('Orchestrator has no tools (delegates only)', () => {
    const orchestrator = mastra.getAgent('orchestrator')
    const tools = orchestrator.getTools()

    // Orchestrator should have no tools or empty tools object
    expect(!tools || Object.keys(tools).length === 0).toBe(true)
  })

  // Note: Full end-to-end agent execution tests require:
  // 1. Valid OpenAI API key
  // 2. Seeded test data in database
  // 3. Network calls enabled
  // These should be run separately as integration tests
})
