/**
 * Agent Network Tests
 *
 * Verifies Agent Network routing and multi-agent orchestration
 */

import { describe, test, expect, beforeEach, beforeAll } from 'vitest'
import { mastra } from '../index'
import { createXPShareContext } from '../context'

describe('Agent Network', () => {
  let mockSupabase: any
  let context: any

  // Mock DATABASE_URL for tests
  beforeAll(() => {
    process.env.DATABASE_URL = 'postgresql://localhost:5432/test'
  })

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

  test('Query agent has all 5 search tools', async () => {
    const query = mastra.getAgent('query')
    const tools = await query.getTools()

    expect(tools).toBeDefined()
    expect(tools.advancedSearch).toBeDefined()
    expect(tools.searchByAttributes).toBeDefined()
    expect(tools.semanticSearch).toBeDefined()
    expect(tools.fullTextSearch).toBeDefined()
    expect(tools.geoSearch).toBeDefined()
  })

  test('Viz agent has temporal analysis tool', async () => {
    const viz = mastra.getAgent('viz')
    const tools = await viz.getTools()

    expect(tools).toBeDefined()
    expect(tools.temporalAnalysis).toBeDefined()
  })

  test('Insight agent has all 4 insights tools', async () => {
    const insight = mastra.getAgent('insight')
    const tools = await insight.getTools()

    expect(tools).toBeDefined()
    expect(tools.generateInsights).toBeDefined()
    expect(tools.predictTrends).toBeDefined()
    expect(tools.detectPatterns).toBeDefined()
    expect(tools.suggestFollowups).toBeDefined()
    // NOTE: exportResults removed per MASTRAMIGRATION.md spec (4 tools only)
  })

  test('Relationship agent has all 4 relationship tools', async () => {
    const relationship = mastra.getAgent('relationship')
    const tools = await relationship.getTools()

    expect(tools).toBeDefined()
    expect(tools.findConnections).toBeDefined()
    expect(tools.analyzeCategory).toBeDefined()
    expect(tools.compareCategories).toBeDefined()
    expect(tools.attributeCorrelation).toBeDefined()
    // NOTE: rankUsers and detectPatterns removed per MASTRAMIGRATION.md spec (4 tools only)
  })

  test('Orchestrator has no tools (delegates only)', async () => {
    const orchestrator = mastra.getAgent('orchestrator')
    const tools = await orchestrator.getTools()

    // Orchestrator should have no tools or empty tools object
    expect(!tools || Object.keys(tools).length === 0).toBe(true)
  })

  // Note: Full end-to-end agent execution tests require:
  // 1. Valid OpenAI API key
  // 2. Seeded test data in database
  // 3. Network calls enabled
  // These should be run separately as integration tests
})
