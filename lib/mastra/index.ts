/**
 * XPShare Mastra - Main Instance
 *
 * Unified orchestrator agents with storage configuration
 * - orchestrator: Original agent using .generate()
 * - networkOrchestrator: New Agent Network with .network()
 */

import { Mastra } from '@mastra/core'
import { PostgresStore } from '@mastra/pg'

// Import orchestrator agents
import { orchestratorAgent } from './agents/orchestrator'
import { networkOrchestratorAgent } from './agents/orchestrator-network'

/**
 * Main Mastra instance for XPShare AI
 *
 * Configuration:
 * - Two agents: orchestrator (generate) + networkOrchestrator (network)
 * - Storage: Conditional (LibSQLStore :memory: local, PostgresStore production)
 */
// Debug logging
const storageProvider = new PostgresStore({
  connectionString: process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL!,
})

console.log('[Mastra Init] NODE_ENV:', process.env.NODE_ENV)
console.log('[Mastra Init] Storage Provider:', storageProvider.constructor.name)

export const mastra = new Mastra({
  // Register both agents
  agents: {
    orchestrator: orchestratorAgent,
    networkOrchestrator: networkOrchestratorAgent,
  },

  // Storage configuration for memory (required by Agent Network)
  // Development: LibSQLStore with :memory: URL (in-memory, fast, ephemeral)
  // Production: PostgresStore with Supabase Direct Connection (persistent)
  storage: storageProvider,
})

// Export agents for direct access if needed
export { orchestratorAgent, networkOrchestratorAgent }

/**
 * Helper to get agent by name
 *
 * Prefer this over direct imports to get access to Mastra instance configuration
 * (logger, telemetry, storage, etc.)
 */
export function getAgent(name: 'orchestrator' | 'networkOrchestrator') {
  return mastra.getAgent(name)
}
