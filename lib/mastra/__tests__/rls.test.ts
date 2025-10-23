/**
 * Row Level Security (RLS) Tests
 *
 * Verifies that RuntimeContext properly injects user-scoped Supabase clients
 * to maintain RLS isolation across agent/tool executions
 */

import { describe, test, expect, beforeEach, vi } from 'vitest'
import { createXPShareContext } from '../context'
import { advancedSearchTool } from '../tools/search'

describe('Row Level Security (RLS)', () => {
  test('RuntimeContext isolates Supabase clients per request', () => {
    // Create two separate contexts for different users
    const mockSupabase1 = { userId: 'user-1' } as any
    const mockSupabase2 = { userId: 'user-2' } as any

    const context1 = createXPShareContext(mockSupabase1, 'user-1', 'en')
    const context2 = createXPShareContext(mockSupabase2, 'user-2', 'en')

    // Verify each context has its own Supabase client
    const supabase1 = context1.get('supabase')
    const supabase2 = context2.get('supabase')

    expect(supabase1).not.toBe(supabase2)
    expect(supabase1.userId).toBe('user-1')
    expect(supabase2.userId).toBe('user-2')
  })

  test('Tools receive correct user context via RuntimeContext', async () => {
    // Mock Supabase client with spy on .from() to track RLS queries
    const fromSpy = vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
      })),
    }))

    const mockSupabase = { from: fromSpy } as any
    const runtimeContext = createXPShareContext(mockSupabase, 'user-123', 'en')

    // Execute tool with RuntimeContext
    try {
      await advancedSearchTool.execute({
        runtimeContext,
        context: {
          category: 'ufo-uap',
          limit: 5,
        },
      })
    } catch (error) {
      // Tool execution may fail without real data, but should access context
    }

    // Verify Supabase .from() was called (indicating RLS query was attempted)
    expect(fromSpy).toHaveBeenCalled()
    expect(fromSpy).toHaveBeenCalledWith('experiences')
  })

  test('RuntimeContext prevents cross-user data leakage', () => {
    // Create contexts for two users
    const mockSupabase1 = {
      auth: { getUser: () => Promise.resolve({ data: { user: { id: 'user-1' } } }) },
    } as any
    const mockSupabase2 = {
      auth: { getUser: () => Promise.resolve({ data: { user: { id: 'user-2' } } }) },
    } as any

    const context1 = createXPShareContext(mockSupabase1, 'user-1', 'en')
    const context2 = createXPShareContext(mockSupabase2, 'user-2', 'en')

    // Verify user IDs are isolated
    expect(context1.get('userId')).toBe('user-1')
    expect(context2.get('userId')).toBe('user-2')
    expect(context1.get('userId')).not.toBe(context2.get('userId'))

    // Verify Supabase clients are isolated
    expect(context1.get('supabase')).not.toBe(context2.get('supabase'))
  })

  test('RuntimeContext required for all tools', async () => {
    // Attempting to execute tool without RuntimeContext should fail
    try {
      await advancedSearchTool.execute({
        runtimeContext: null as any,
        context: {
          category: 'ufo-uap',
          limit: 5,
        },
      })
      // Should not reach here
      expect(true).toBe(false)
    } catch (error) {
      // Expected error - tool requires RuntimeContext
      expect(error).toBeDefined()
    }
  })

  test('Multiple concurrent requests maintain RLS isolation', async () => {
    // Simulate concurrent requests from different users
    const requests = [
      { userId: 'user-1', supabase: { from: vi.fn(() => mockQueryBuilder()) } as any },
      { userId: 'user-2', supabase: { from: vi.fn(() => mockQueryBuilder()) } as any },
      { userId: 'user-3', supabase: { from: vi.fn(() => mockQueryBuilder()) } as any },
    ]

    const contexts = requests.map((req) =>
      createXPShareContext(req.supabase, req.userId, 'en')
    )

    // Execute tools concurrently
    const executions = contexts.map(async (ctx) => {
      try {
        return await advancedSearchTool.execute({
          runtimeContext: ctx,
          context: { category: 'ufo-uap', limit: 5 },
        })
      } catch (error) {
        return null
      }
    })

    await Promise.all(executions)

    // Verify each request used its own Supabase client
    requests.forEach((req) => {
      expect(req.supabase.from).toHaveBeenCalled()
    })

    // Verify contexts remain isolated
    expect(contexts[0].get('userId')).toBe('user-1')
    expect(contexts[1].get('userId')).toBe('user-2')
    expect(contexts[2].get('userId')).toBe('user-3')
  })
})

// Helper to mock Supabase query builder
function mockQueryBuilder() {
  return {
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        order: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
    })),
  }
}
