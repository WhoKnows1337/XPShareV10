/**
 * Mastra Setup Tests
 *
 * Verifies Mastra installation and basic functionality
 */

import { describe, test, expect } from 'vitest'
import { Mastra } from '@mastra/core'
import { Agent } from '@mastra/core/agent'
import { createTool } from '@mastra/core/tools'
import { RuntimeContext } from '@mastra/core/runtime-context'
import { z } from 'zod'
import { createXPShareContext, getSupabaseFromContext } from '../context'
import type { XPShareContext } from '../types'

describe('Mastra Setup', () => {
  test('Mastra instance initializes', () => {
    const testMastra = new Mastra({ agents: {} })
    expect(testMastra).toBeDefined()
  })

  test('Agent can be created', () => {
    const testAgent = new Agent({
      name: 'test-agent',
      instructions: 'You are a test agent',
      model: 'openai/gpt-4o-mini',
    })

    expect(testAgent).toBeDefined()
    expect(testAgent.name).toBe('test-agent')
  })

  test('Tool can be created', () => {
    const testTool = createTool({
      id: 'test-tool',
      description: 'A test tool',
      inputSchema: z.object({
        input: z.string(),
      }),
      outputSchema: z.object({
        output: z.string(),
      }),
      execute: async ({ data }) => {
        return { output: `Processed: ${data.input}` }
      },
    })

    expect(testTool).toBeDefined()
    expect(testTool.id).toBe('test-tool')
  })

  test('RuntimeContext can be created', () => {
    // Mock Supabase client
    const mockSupabase = {
      from: () => ({
        select: () => Promise.resolve({ data: [], error: null }),
      }),
    } as any

    const context = createXPShareContext(mockSupabase, 'test-user-123', 'en')

    expect(context).toBeDefined()
    expect(context.get('userId')).toBe('test-user-123')
    expect(context.get('locale')).toBe('en')
  })

  test('RuntimeContext provides Supabase client', () => {
    const mockSupabase = { test: 'mock' } as any
    const context = createXPShareContext(mockSupabase, 'test-user', 'en')

    const extractedSupabase = getSupabaseFromContext(context)
    expect(extractedSupabase).toBe(mockSupabase)
  })

  test('Tool can access RuntimeContext', async () => {
    const contextAwareTool = createTool<XPShareContext>({
      id: 'context-tool',
      description: 'Tool that uses context',
      inputSchema: z.object({
        query: z.string(),
      }),
      outputSchema: z.object({
        userId: z.string(),
        result: z.string(),
      }),
      execute: async ({ runtimeContext, context }) => {
        // Note: Mastra tools use 'runtimeContext' parameter
        const userId = runtimeContext.get('userId')
        const supabase = runtimeContext.get('supabase')

        return {
          userId,
          result: `Query "${context.query}" by user ${userId}`,
        }
      },
    })

    const mockSupabase = {} as any
    const runtimeContext = createXPShareContext(mockSupabase, 'user-456', 'en')

    const result = await contextAwareTool.execute({
      context: { query: 'test query' },
      runtimeContext,
    })

    expect(result.userId).toBe('user-456')
    expect(result.result).toContain('test query')
  })
})
