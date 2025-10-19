/**
 * Search 5.0 - Error Recovery Strategies
 *
 * Implements P0 production-critical error recovery:
 * - Exponential backoff retry logic
 * - Fallback to simpler prompts
 * - Graceful degradation with partial results
 * - Circuit breaker pattern
 *
 * @see docs/masterdocs/search5.md (Error Recovery section)
 */

export interface RetryOptions {
  maxAttempts?: number
  baseDelay?: number
  maxDelay?: number
  timeout?: number
}

export interface ErrorRecoveryResult<T> {
  success: boolean
  data?: T
  error?: Error
  attempts: number
  recoveryStrategy?: 'retry' | 'fallback' | 'degraded'
}

/**
 * Exponential backoff retry with configurable options
 *
 * @example
 * const result = await retryWithBackoff(
 *   () => generateText({...}),
 *   { maxAttempts: 3, baseDelay: 1000 }
 * )
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<ErrorRecoveryResult<T>> {
  const {
    maxAttempts = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    timeout = 15000
  } = options

  let lastError: Error | undefined

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // Wrap in timeout
      const result = await Promise.race([
        fn(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Operation timeout')), timeout)
        )
      ])

      return {
        success: true,
        data: result,
        attempts: attempt,
        recoveryStrategy: attempt > 1 ? 'retry' : undefined
      }
    } catch (error: any) {
      lastError = error
      console.warn(`⚠️ Attempt ${attempt}/${maxAttempts} failed:`, error.message)

      // Don't retry on last attempt
      if (attempt < maxAttempts) {
        // Exponential backoff: delay = baseDelay * 2^(attempt-1)
        const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay)
        console.log(`🔄 Retrying in ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  return {
    success: false,
    error: lastError || new Error('All retry attempts failed'),
    attempts: maxAttempts,
    recoveryStrategy: 'retry'
  }
}

/**
 * Fallback strategy: Try operation with increasingly simpler parameters
 *
 * @example
 * const result = await fallbackStrategy([
 *   () => complexQuery(),
 *   () => mediumQuery(),
 *   () => simpleQuery()
 * ])
 */
export async function fallbackStrategy<T>(
  strategies: Array<() => Promise<T>>
): Promise<ErrorRecoveryResult<T>> {
  let lastError: Error | undefined

  for (let i = 0; i < strategies.length; i++) {
    try {
      const result = await strategies[i]()
      return {
        success: true,
        data: result,
        attempts: i + 1,
        recoveryStrategy: i > 0 ? 'fallback' : undefined
      }
    } catch (error: any) {
      lastError = error
      console.warn(`⚠️ Fallback strategy ${i + 1}/${strategies.length} failed:`, error.message)
    }
  }

  return {
    success: false,
    error: lastError || new Error('All fallback strategies failed'),
    attempts: strategies.length,
    recoveryStrategy: 'fallback'
  }
}

/**
 * Graceful degradation: Return partial results on error
 *
 * Useful for pattern discovery where some patterns might be found
 * even if the full operation fails.
 */
export function gracefulDegradation<T extends { patterns?: any[] }>(
  partialData: T,
  error: Error
): ErrorRecoveryResult<T> {
  const hasPatterns = partialData.patterns && partialData.patterns.length > 0

  if (hasPatterns) {
    console.warn('⚠️ Returning partial results due to error:', error.message)
    return {
      success: true,
      data: partialData,
      error,
      attempts: 1,
      recoveryStrategy: 'degraded'
    }
  }

  return {
    success: false,
    error,
    attempts: 1
  }
}

/**
 * Circuit breaker pattern for preventing cascading failures
 *
 * Tracks failures and stops trying after threshold is reached
 */
export class CircuitBreaker {
  private failures = 0
  private lastFailureTime: number | null = null
  private state: 'closed' | 'open' | 'half-open' = 'closed'

  constructor(
    private threshold: number = 5,
    private timeout: number = 60000, // 1 minute
    private resetTimeout: number = 30000 // 30 seconds
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      // Check if we should try again (half-open state)
      if (this.lastFailureTime && Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = 'half-open'
        console.log('🔌 Circuit breaker: half-open, trying again...')
      } else {
        throw new Error('Circuit breaker is OPEN - too many recent failures')
      }
    }

    try {
      const result = await fn()

      // Success: reset circuit breaker
      if (this.state === 'half-open') {
        console.log('✅ Circuit breaker: closed after successful recovery')
        this.state = 'closed'
        this.failures = 0
      }

      return result
    } catch (error) {
      this.failures++
      this.lastFailureTime = Date.now()

      if (this.failures >= this.threshold) {
        this.state = 'open'
        console.error(`🔌 Circuit breaker OPENED after ${this.failures} failures`)
      }

      throw error
    }
  }

  reset() {
    this.failures = 0
    this.lastFailureTime = null
    this.state = 'closed'
  }

  getState() {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime
    }
  }
}

/**
 * Global circuit breaker instance for pattern discovery
 * Prevents cascading failures when OpenAI API is down
 */
export const patternDiscoveryCircuitBreaker = new CircuitBreaker(5, 60000, 30000)
