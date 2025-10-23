/**
 * XPShare Mastra - Main Instance
 *
 * Central Mastra instance with Agent Network configuration
 */

import { Mastra } from '@mastra/core'

// Import all agents
import { orchestratorAgent } from './agents/orchestrator'
import { queryAgent } from './agents/query-agent'
import { vizAgent } from './agents/viz-agent'
import { insightAgent } from './agents/insight-agent'
import { relationshipAgent } from './agents/relationship-agent'

/**
 * Main Mastra instance for XPShare AI
 *
 * Configuration:
 * - 5 Specialized Agents: Orchestrator, Query, Viz, Insight, Relationship
 * - Agent Network: Enabled with Orchestrator as router
 * - LLM-based semantic routing (GPT-4o for orchestrator)
 */
export const mastra = new Mastra({
  // Register all agents
  agents: {
    orchestrator: orchestratorAgent,
    query: queryAgent,
    viz: vizAgent,
    insight: insightAgent,
    relationship: relationshipAgent,
  },

  // Agent Network configuration - ENABLED
  agentNetwork: {
    enabled: true,
    router: 'orchestrator', // Orchestrator agent handles routing
    strategy: 'llm', // LLM-based semantic routing (not keyword)
    fallback: {
      agent: 'query', // Default to Query Agent if routing unclear
      maxRetries: 2,
    },
  },
})

// Export individual agents for direct access if needed
export { orchestratorAgent, queryAgent, vizAgent, insightAgent, relationshipAgent }

/**
 * Helper to get agent by name
 *
 * Prefer this over direct imports to get access to Mastra instance configuration
 * (logger, telemetry, storage, etc.)
 */
export function getAgent(name: string) {
  return mastra.getAgent(name)
}
