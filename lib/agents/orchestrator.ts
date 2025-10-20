/**
 * XPShare AI - Orchestrator Agent
 *
 * Master coordinator that orchestrates the entire AI workflow.
 * Analyzes user intent, creates execution plans, delegates to specialist agents,
 * and synthesizes comprehensive responses.
 *
 * Model: GPT-4o (best reasoning capabilities)
 */

import { openai } from '@ai-sdk/openai'
import { generateText, tool } from 'ai'
import { z } from 'zod'
import type { AgentMessage } from '@/types/ai-system'
import { QueryAgent } from './query-agent'
import { VizAgent } from './viz-agent'
import { InsightAgent } from './insight-agent'

// ============================================================================
// System Prompt
// ============================================================================

const ORCHESTRATOR_SYSTEM_PROMPT = `You are the XPShare AI Orchestrator.

Your role:
1. Understand complex user questions about extraordinary experiences
2. Break them into executable sub-tasks
3. Delegate to specialist agents
4. Synthesize responses with citations
5. Learn user preferences over time

Available Specialists:
- QUERY AGENT: Database searches, filtering, aggregations
- VIZ AGENT: Visualization selection and generation
- INSIGHT AGENT: Pattern detection, explanations, predictions

Database:
- 54 categories (UFO, Dreams, NDE, Synchronicity, Psychic, Ghost, etc.)
- 164 attributes (dream_symbol, ufo_shape, entity_type, etc.)
- Geographic, temporal, semantic data
- Multi-language full-text search (de, en, fr, es)

Memory & Personalization:
- User Profile Memory: Long-term preferences (categories, visualization types, language)
- Session Memory: Short-term context (recent searches, active filters)
- Use memory to personalize responses and anticipate needs

Citations:
- ALWAYS generate citations when referencing specific experiences
- Use footnote style [1][2][3] in responses
- Link citations to source experiences

IMPORTANT:
- Use Query Agent for ALL data retrieval
- Use Viz Agent when user wants to "see" something
- Use Insight Agent for "why" questions or pattern analysis
- Combine multiple agents for complex queries
- Always include citations for factual claims
- Update user preferences based on conversation patterns
- Always explain your reasoning

Example Workflow:
User: "Zeig mir UFOs in Berlin und erkläre Muster"
1. Delegate to Query Agent → Get UFO experiences in Berlin
2. Delegate to Viz Agent → Generate map
3. Delegate to Insight Agent → Analyze patterns
4. Synthesize → Combine into coherent response`

// ============================================================================
// Type Definitions
// ============================================================================

interface ExecutionPlan {
  steps: ExecutionStep[]
  reasoning: string
}

interface ExecutionStep {
  agent: 'query' | 'viz' | 'insight'
  task: string
  parameters?: any
  data?: any
  context?: any
}

interface AgentResult {
  agent: 'query' | 'viz' | 'insight'
  data: any
  error?: string
}

interface OrchestratorResponse {
  text: string
  visualizations: any[]
  insights: any[]
  data: any[]
  citations?: any[]
}

// ============================================================================
// Orchestrator Agent Class
// ============================================================================

export class OrchestratorAgent {
  private queryAgent: QueryAgent
  private vizAgent: VizAgent
  private insightAgent: InsightAgent

  constructor() {
    this.queryAgent = new QueryAgent()
    this.vizAgent = new VizAgent()
    this.insightAgent = new InsightAgent()
  }

  /**
   * Process user message and orchestrate specialist agents
   */
  async process(
    userMessage: string,
    conversationHistory: AgentMessage[] = []
  ): Promise<OrchestratorResponse> {
    // Step 1: Analyze intent and create execution plan
    const plan = await this.createExecutionPlan(userMessage, conversationHistory)

    // Step 2: Execute plan with specialist agents
    const results = await this.executePlan(plan)

    // Step 3: Synthesize comprehensive response
    return await this.synthesizeResponse(results, userMessage, plan.reasoning)
  }

  /**
   * Create execution plan by analyzing user intent
   */
  private async createExecutionPlan(
    userMessage: string,
    history: AgentMessage[]
  ): Promise<ExecutionPlan> {
    const { text, toolCalls } = await generateText({
      model: openai('gpt-4o'),
      messages: [
        { role: 'system', content: ORCHESTRATOR_SYSTEM_PROMPT },
        ...history,
        { role: 'user', content: userMessage },
      ],
      tools: {
        delegate_to_query_agent: tool({
          description: 'Delegate data retrieval task to Query Agent',
          parameters: z.object({
            task: z.string().describe('Description of the query task'),
            parameters: z
              .any()
              .describe('Parameters for the query (categories, filters, etc.)'),
          }),
        }),
        delegate_to_viz_agent: tool({
          description: 'Delegate visualization task to Viz Agent',
          parameters: z.object({
            task: z.string().describe('Description of the visualization task'),
            data: z.any().describe('Data to be visualized'),
          }),
        }),
        delegate_to_insight_agent: tool({
          description: 'Delegate analysis task to Insight Agent',
          parameters: z.object({
            task: z.string().describe('Description of the analysis task'),
            context: z.any().describe('Context and data for analysis'),
          }),
        }),
      },
      maxSteps: 5,
      temperature: 0.3,
    })

    return this.parseExecutionPlan(text, toolCalls || [])
  }

  /**
   * Parse execution plan from LLM response
   */
  private parseExecutionPlan(reasoning: string, toolCalls: any[]): ExecutionPlan {
    const steps: ExecutionStep[] = []

    for (const call of toolCalls) {
      const { toolName, args } = call

      if (toolName === 'delegate_to_query_agent') {
        steps.push({
          agent: 'query',
          task: args.task,
          parameters: args.parameters,
        })
      } else if (toolName === 'delegate_to_viz_agent') {
        steps.push({
          agent: 'viz',
          task: args.task,
          data: args.data,
        })
      } else if (toolName === 'delegate_to_insight_agent') {
        steps.push({
          agent: 'insight',
          task: args.task,
          context: args.context,
        })
      }
    }

    return {
      steps,
      reasoning,
    }
  }

  /**
   * Execute execution plan by delegating to specialist agents
   */
  private async executePlan(plan: ExecutionPlan): Promise<AgentResult[]> {
    const results: AgentResult[] = []

    for (const step of plan.steps) {
      try {
        let data: any

        switch (step.agent) {
          case 'query':
            // Query Agent will be implemented next
            data = await this.executeQueryAgent(step.task, step.parameters)
            results.push({ agent: 'query', data })
            break

          case 'viz':
            // Viz Agent will be implemented next
            data = await this.executeVizAgent(step.task, step.data)
            results.push({ agent: 'viz', data })
            break

          case 'insight':
            // Insight Agent will be implemented next
            data = await this.executeInsightAgent(step.task, step.context)
            results.push({ agent: 'insight', data })
            break
        }
      } catch (error) {
        console.error(`Error executing ${step.agent} agent:`, error)
        results.push({
          agent: step.agent,
          data: null,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    return results
  }

  /**
   * Execute Query Agent
   */
  private async executeQueryAgent(task: string, parameters: any): Promise<any> {
    return await this.queryAgent.execute(task, parameters)
  }

  /**
   * Execute Viz Agent
   */
  private async executeVizAgent(task: string, data: any): Promise<any> {
    return await this.vizAgent.execute(task, data)
  }

  /**
   * Execute Insight Agent
   */
  private async executeInsightAgent(task: string, context: any): Promise<any> {
    return await this.insightAgent.execute(task, context)
  }

  /**
   * Synthesize comprehensive response from all agent results
   */
  private async synthesizeResponse(
    results: AgentResult[],
    userMessage: string,
    reasoning: string
  ): Promise<OrchestratorResponse> {
    const { text } = await generateText({
      model: openai('gpt-4o'),
      prompt: `
User asked: "${userMessage}"

Your reasoning: ${reasoning}

Results from specialist agents:
${JSON.stringify(results, null, 2)}

Create a comprehensive response that:
1. Answers the user's question directly
2. Includes visualizations where appropriate
3. Provides insights and context
4. Suggests follow-up questions
5. Is conversational and helpful
6. Uses citations [1][2][3] when referencing specific experiences

Format your response in markdown with clear sections.
      `,
      temperature: 0.7,
    })

    return {
      text,
      visualizations: results
        .filter((r) => r.agent === 'viz' && !r.error)
        .map((r) => r.data),
      insights: results
        .filter((r) => r.agent === 'insight' && !r.error)
        .map((r) => r.data),
      data: results
        .filter((r) => r.agent === 'query' && !r.error)
        .map((r) => r.data),
    }
  }
}
