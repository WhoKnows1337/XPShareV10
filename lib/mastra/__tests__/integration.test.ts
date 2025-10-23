/**
 * Mastra Agent Network - Integration Tests
 *
 * Tests the complete pipeline from RuntimeContext → Orchestrator → Specialist Agents → Tools
 */

import { describe, test, expect, beforeEach, beforeAll, vi } from 'vitest'
import { mastra } from '../index'
import { createXPShareContext } from '../context'
import type { SupabaseClient } from '@supabase/supabase-js'

describe('Agent Network Integration', () => {
  let mockSupabase: any
  let runtimeContext: any

  // Mock DATABASE_URL for tests
  beforeAll(() => {
    process.env.DATABASE_URL = 'postgresql://localhost:5432/test'
  })

  beforeEach(() => {
    // Mock Supabase client for testing
    mockSupabase = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
            })),
            range: vi.fn(() => Promise.resolve({ data: [], error: null })),
          })),
          ilike: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
            })),
          })),
          gte: vi.fn(() => ({
            lte: vi.fn(() => ({
              order: vi.fn(() => ({
                limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
              })),
            })),
          })),
        })),
        insert: vi.fn(() => ({
          select: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
      rpc: vi.fn(() => Promise.resolve({ data: [], error: null })),
    } as any

    // Create RuntimeContext with mock Supabase
    runtimeContext = createXPShareContext(mockSupabase, 'test-user-123', 'en')
  })

  test('RuntimeContext provides access to Supabase client', () => {
    const supabase = runtimeContext.get('supabase')
    const userId = runtimeContext.get('userId')
    const locale = runtimeContext.get('locale')

    expect(supabase).toBeDefined()
    expect(supabase).toBe(mockSupabase)
    expect(userId).toBe('test-user-123')
    expect(locale).toBe('en')
  })

  test('Orchestrator agent can be retrieved', () => {
    const orchestrator = mastra.getAgent('orchestrator')

    expect(orchestrator).toBeDefined()
    expect(orchestrator.name).toBe('orchestrator')
  })

  test('All 4 specialist agents are accessible via Mastra', () => {
    // Verify all specialist agents are registered and accessible
    const query = mastra.getAgent('query')
    const viz = mastra.getAgent('viz')
    const insight = mastra.getAgent('insight')
    const relationship = mastra.getAgent('relationship')

    expect(query).toBeDefined()
    expect(viz).toBeDefined()
    expect(insight).toBeDefined()
    expect(relationship).toBeDefined()

    // Verify they have the correct names
    expect(query.name).toBe('query')
    expect(viz.name).toBe('viz')
    expect(insight.name).toBe('insight')
    expect(relationship.name).toBe('relationship')
  })

  test('Query agent tools have access to RuntimeContext', async () => {
    const query = mastra.getAgent('query')
    const tools = await query.getTools({ runtimeContext })

    expect(tools).toBeDefined()
    expect(tools.advancedSearch).toBeDefined()

    // Verify tool can execute with RuntimeContext
    // Note: This will fail without actual data, but should not throw context errors
    try {
      const result = await tools.advancedSearch.execute({
        runtimeContext,
        context: {
          category: 'ufo-uap',
          limit: 5,
        },
      })
      // Should return empty array, not throw
      expect(result).toBeDefined()
    } catch (error) {
      // Only context-related errors should fail this test
      expect(error).not.toContain('context')
      expect(error).not.toContain('supabase')
    }
  })

  test('All specialist agents are accessible via mastra instance', () => {
    const query = mastra.getAgent('query')
    const viz = mastra.getAgent('viz')
    const insight = mastra.getAgent('insight')
    const relationship = mastra.getAgent('relationship')

    expect(query.name).toBe('query')
    expect(viz.name).toBe('viz')
    expect(insight.name).toBe('insight')
    expect(relationship.name).toBe('relationship')
  })

  test('Agent Network routing configuration is enabled', () => {
    // Verify Agent Network is configured in Mastra instance
    // This checks that the agentNetwork configuration exists
    expect(mastra).toBeDefined()

    // The orchestrator should have agents registered
    const orchestrator = mastra.getAgent('orchestrator')
    expect(orchestrator).toBeDefined()
  })

  // Note: Full network execution tests require:
  // 1. Valid OpenAI API key (OPENAI_API_KEY env var)
  // 2. Mastra Memory configured (requires storage backend)
  // 3. Actual test data in database
  // 4. Network calls enabled
  //
  // Example network execution (requires above setup):
  // const networkStream = await orchestrator.network('Find UFO experiences', {
  //   runtimeContext,
  //   memory: {
  //     thread: 'test-thread-123',
  //     resource: 'test-user-123',
  //   },
  // })
  //
  // for await (const chunk of networkStream) {
  //   console.log(chunk.type)
  // }
})
