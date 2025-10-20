/**
 * XPShare AI - Agent Communication Bus
 *
 * Message bus for inter-agent communication.
 * Handles routing, priority, and error handling.
 */

import type { AgentMessage } from '@/types/ai-system'

// ============================================================================
// Type Definitions
// ============================================================================

export interface BusMessage {
  from: 'orchestrator' | 'query' | 'viz' | 'insight'
  to: 'orchestrator' | 'query' | 'viz' | 'insight'
  type: 'request' | 'response' | 'error'
  payload: any
  metadata: {
    timestamp: number
    requestId: string
    priority: 'high' | 'normal' | 'low'
  }
}

type MessageHandler = (msg: BusMessage) => Promise<any>

// ============================================================================
// Agent Bus Class
// ============================================================================

/**
 * Message bus for agent-to-agent communication
 */
export class AgentBus {
  private handlers = new Map<string, MessageHandler>()
  private messageHistory: BusMessage[] = []
  private maxHistorySize = 100

  /**
   * Register an agent handler
   */
  register(agentType: 'orchestrator' | 'query' | 'viz' | 'insight', handler: MessageHandler) {
    this.handlers.set(agentType, handler)
  }

  /**
   * Send message to specific agent
   */
  async send(message: BusMessage): Promise<any> {
    // Validate message
    if (!message.to) {
      throw new Error('Message must have a "to" field')
    }

    // Get handler
    const handler = this.handlers.get(message.to)
    if (!handler) {
      throw new Error(`No handler registered for agent: ${message.to}`)
    }

    // Add timestamp if missing
    if (!message.metadata) {
      message.metadata = {
        timestamp: Date.now(),
        requestId: this.generateRequestId(),
        priority: 'normal',
      }
    }

    // Store in history
    this.addToHistory(message)

    try {
      // Execute handler
      const result = await handler(message)

      // Store response in history
      this.addToHistory({
        from: message.to,
        to: message.from,
        type: 'response',
        payload: result,
        metadata: {
          ...message.metadata,
          timestamp: Date.now(),
        },
      })

      return result
    } catch (error) {
      // Store error in history
      this.addToHistory({
        from: message.to,
        to: message.from,
        type: 'error',
        payload: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        metadata: {
          ...message.metadata,
          timestamp: Date.now(),
        },
      })

      throw error
    }
  }

  /**
   * Broadcast message to all agents
   */
  async broadcast(message: Omit<BusMessage, 'to'>): Promise<Map<string, any>> {
    const results = new Map<string, any>()

    for (const [agentType, handler] of this.handlers) {
      try {
        const fullMessage: BusMessage = {
          ...message,
          to: agentType as any,
        }

        const result = await this.send(fullMessage)
        results.set(agentType, result)
      } catch (error) {
        results.set(agentType, {
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    return results
  }

  /**
   * Get message history
   */
  getHistory(count?: number): BusMessage[] {
    return count
      ? this.messageHistory.slice(-count)
      : this.messageHistory
  }

  /**
   * Clear message history
   */
  clearHistory() {
    this.messageHistory = []
  }

  /**
   * Get registered agents
   */
  getRegisteredAgents(): string[] {
    return Array.from(this.handlers.keys())
  }

  /**
   * Add message to history
   */
  private addToHistory(message: BusMessage) {
    this.messageHistory.push(message)

    // Limit history size
    if (this.messageHistory.length > this.maxHistorySize) {
      this.messageHistory.shift()
    }
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}
