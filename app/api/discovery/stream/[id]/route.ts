/**
 * Discovery Stream API - Server-Sent Events
 * Streams discovery events in real-time during experience analysis
 */

import { NextRequest } from 'next/server';
import { generateDiscoveryEvents, getDiscoveryResult } from '@/lib/discovery/stream-events';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Create a TransformStream for Server-Sent Events
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();

  // Start streaming events
  (async () => {
    try {
      // Generate all discovery events
      const events = await generateDiscoveryEvents(id);

      // Send events with delays
      for (const event of events) {
        const delay = event.timestamp - Date.now();

        if (delay > 0) {
          await new Promise((resolve) => setTimeout(resolve, Math.min(delay, 2000)));
        }

        // Send event
        const data = JSON.stringify(event);
        await writer.write(
          encoder.encode(`data: ${data}\n\n`)
        );
      }

      // Get final result
      const result = await getDiscoveryResult(id);

      // Send completion event with result
      const completeEvent = {
        type: 'complete',
        timestamp: Date.now(),
        data: result,
      };

      await writer.write(
        encoder.encode(`data: ${JSON.stringify(completeEvent)}\n\n`)
      );

      // Close stream
      await writer.close();
    } catch (error) {
      console.error('Error in discovery stream:', error);

      // Send error event
      const errorEvent = {
        type: 'error',
        timestamp: Date.now(),
        data: { message: 'Failed to generate discovery events' },
      };

      await writer.write(
        encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`)
      );

      await writer.close();
    }
  })();

  // Return the stream as a Response
  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  });
}
