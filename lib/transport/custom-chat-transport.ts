/**
 * Custom Chat Transport with Detailed Error Logging
 *
 * Purpose: Debug intermittent SERVER_ERROR in AI SDK streaming
 * - Longer timeout (150s vs default)
 * - Detailed console logging for error diagnosis
 * - Explicit SSE stream parsing
 */

import { ChatTransport, DefaultChatTransport } from 'ai'

export interface CustomChatTransportOptions {
  api: string
  body?: Record<string, unknown>
  timeout?: number
}

export class CustomChatTransport implements ChatTransport<any> {
  private defaultTransport: DefaultChatTransport<any>

  constructor(options: CustomChatTransportOptions) {
    console.log('[CustomChatTransport] Initializing with options:', {
      api: options.api,
      timeout: options.timeout ?? 150000,
      bodyKeys: Object.keys(options.body ?? {}),
    })

    // Use DefaultChatTransport internally for proper SSE handling
    this.defaultTransport = new DefaultChatTransport({
      api: options.api,
      body: options.body,
      fetch: async (url, init) => {
        const startTime = performance.now()

        console.log('[CustomChatTransport] fetch() starting:', {
          url,
          method: init?.method,
          headers: init?.headers,
          bodyPreview: init?.body
            ? JSON.stringify(JSON.parse(init.body as string)).slice(0, 200)
            : undefined,
          timestamp: new Date().toISOString(),
        })

        try {
          // Call native fetch with timeout
          const controller = new AbortController()
          const timeout = options.timeout ?? 150000
          const timeoutId = setTimeout(() => {
            console.error('[CustomChatTransport] fetch() timeout after', timeout, 'ms')
            controller.abort()
          }, timeout)

          // Merge abort signals
          const combinedSignal = init?.signal
            ? AbortSignal.any([init.signal, controller.signal])
            : controller.signal

          const response = await fetch(url, {
            ...init,
            signal: combinedSignal,
          })

          clearTimeout(timeoutId)

          const duration = performance.now() - startTime

          console.log('[CustomChatTransport] fetch() response received:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok,
            contentType: response.headers.get('content-type'),
            duration: `${duration.toFixed(0)}ms`,
          })

          // Check if response is OK
          if (!response.ok) {
            const errorText = await response.clone().text()
            console.error('[CustomChatTransport] fetch() non-OK response:', {
              status: response.status,
              statusText: response.statusText,
              bodyPreview: errorText.slice(0, 500),
            })
          }

          // Log stream chunks (non-blocking)
          if (response.ok && response.body) {
            this.logStreamChunks(response.clone(), startTime)
          }

          return response
        } catch (error) {
          const duration = performance.now() - startTime

          console.error('[CustomChatTransport] fetch() failed:', {
            error: error instanceof Error ? error.message : String(error),
            errorName: error instanceof Error ? error.name : 'Unknown',
            duration: `${duration.toFixed(0)}ms`,
            stack: error instanceof Error ? error.stack : undefined,
          })

          throw error
        }
      },
    })
  }

  /**
   * Send messages to the AI endpoint (delegates to DefaultChatTransport)
   */
  async sendMessages(options: {
    messages: any[]
    abortSignal?: AbortSignal
  }): Promise<ReadableStream> {
    console.log('[CustomChatTransport] sendMessages() called:', {
      messageCount: options.messages.length,
      hasAbortSignal: !!options.abortSignal,
    })

    try {
      // Properly typed parameters for DefaultChatTransport
      const transportOptions = {
        messages: options.messages,
        trigger: 'submit-message' as const,
        chatId: 'chat-' + Date.now(),
        messageId: undefined as string | undefined,
        abortSignal: options.abortSignal,
      }
      
      const stream = await this.defaultTransport.sendMessages(transportOptions)
      console.log('[CustomChatTransport] sendMessages() stream received successfully')
      return stream
    } catch (error) {
      console.error('[CustomChatTransport] sendMessages() failed:', {
        error: error instanceof Error ? error.message : String(error),
        errorName: error instanceof Error ? error.name : 'Unknown',
      })
      throw error
    }
  }

  /**
   * Reconnect to an existing stream (delegates to DefaultChatTransport)
   */
  async reconnectToStream(options: any): Promise<ReadableStream | null> {
    console.log('[CustomChatTransport] reconnectToStream() called')
    return this.defaultTransport.reconnectToStream(options)
  }

  /**
   * Log stream chunks for debugging (non-blocking)
   */
  private async logStreamChunks(response: Response, startTime: number) {
    try {
      const reader = response.body?.getReader()
      if (!reader) {
        console.warn('[CustomChatTransport] No response body reader available')
        return
      }

      const decoder = new TextDecoder()
      let chunkCount = 0
      let totalBytes = 0
      let buffer = ''

      console.log('[CustomChatTransport] Stream reading started')

      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          console.log('[CustomChatTransport] Stream complete:', {
            chunkCount,
            totalBytes,
            duration: `${(performance.now() - startTime).toFixed(0)}ms`,
            lastBuffer: buffer.slice(-200), // Last 200 chars
          })
          break
        }

        chunkCount++
        totalBytes += value.length
        const chunk = decoder.decode(value, { stream: true })
        buffer += chunk

        // Log every 10th chunk or if chunk contains error
        if (chunkCount % 10 === 0 || chunk.toLowerCase().includes('error')) {
          console.log('[CustomChatTransport] Stream chunk:', {
            chunkNumber: chunkCount,
            chunkSize: value.length,
            totalBytes,
            preview: chunk.slice(0, 200), // First 200 chars
            containsError: chunk.toLowerCase().includes('error'),
          })
        }

        // Check for SSE format issues
        if (chunkCount === 1 && !chunk.startsWith('data:') && !chunk.includes('data:')) {
          console.error('[CustomChatTransport] First chunk is not SSE format!', {
            chunk: chunk.slice(0, 500),
          })
        }
      }
    } catch (error) {
      console.error('[CustomChatTransport] Stream logging failed:', error)
      // Don't throw - logging is optional
    }
  }
}
