/**
 * XPShare Mastra - Main Instance
 *
 * Central Mastra instance with Agent Network configuration
 */

import { Mastra } from '@mastra/core'

// Agents will be imported here as we create them
// import { orchestratorAgent } from './agents/orchestrator'
// import { queryAgent } from './agents/query-agent'
// import { vizAgent } from './agents/viz-agent'
// import { insightAgent } from './agents/insight-agent'
// import { relationshipAgent } from './agents/relationship-agent'

/**
 * Main Mastra instance for XPShare AI
 *
 * Configuration:
 * - Agent Network: Enabled with Orchestrator as router
 * - Memory: Enabled (in-memory for now, can upgrade to Redis)
 * - Telemetry: Enabled in development only
 */
export const mastra = new Mastra({
  // Agents will be registered here
  agents: {
    // orchestrator: orchestratorAgent,
    // query: queryAgent,
    // viz: vizAgent,
    // insight: insightAgent,
    // relationship: relationshipAgent,
  },

  // Agent Network configuration
  // Uncomment after creating agents
  // agentNetwork: {
  //   enabled: true,
  //   router: 'orchestrator', // Orchestrator agent handles routing
  //   strategy: 'llm', // LLM-based semantic routing (not keyword)
  //   fallback: {
  //     agent: 'query', // Default to Query Agent if routing unclear
  //     maxRetries: 2,
  //   },
  // },

  // Memory configuration (optional - XPShare has custom memory)
  // memory: {
  //   enabled: true,
  //   provider: 'in-memory', // Upgrade to 'upstash-redis' for production
  //   ttl: 3600, // 1 hour
  // },

  // Telemetry for debugging (disable in production)
  // telemetry: {
  //   enabled: process.env.NODE_ENV === 'development',
  //   events: ['agent.start', 'agent.complete', 'tool.execute', 'agent.error'],
  // },
})

// Export individual agents for direct access if needed
// export {
//   orchestratorAgent,
//   queryAgent,
//   vizAgent,
//   insightAgent,
//   relationshipAgent,
// }

/**
 * Helper to get agent by name
 *
 * Prefer this over direct imports to get access to Mastra instance configuration
 * (logger, telemetry, storage, etc.)
 */
export function getAgent(name: string) {
  return mastra.getAgent(name)
}
