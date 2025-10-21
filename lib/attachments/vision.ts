/**
 * Vision API Integration
 *
 * Uses GPT-4o vision capabilities to analyze images.
 * Generates descriptions for multi-modal discovery queries.
 */

import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'

export interface VisionAnalysisResult {
  description: string
  extractedText?: string
  objects?: string[]
  error?: string
}

/**
 * Analyze image with GPT-4o vision
 */
export async function analyzeImage(imageUrl: string): Promise<VisionAnalysisResult> {
  try {
    const result = await generateText({
      model: openai('gpt-4o-mini'), // gpt-4o-mini supports vision
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analyze this image in the context of extraordinary experiences (UFO sightings, dreams, paranormal events, etc.). Describe what you see, any relevant details, and extract any visible text. Be concise but thorough.',
            },
            {
              type: 'image',
              image: imageUrl, // Can be URL or data URL
            },
          ],
        },
      ],
      maxTokens: 500,
      temperature: 0.3, // Low temperature for factual descriptions
    })

    return {
      description: result.text,
    }
  } catch (error) {
    console.error('[Vision] Failed to analyze image:', error)
    return {
      description: '',
      error: error instanceof Error ? error.message : 'Vision analysis failed',
    }
  }
}

/**
 * Extract text from image using OCR-focused prompt
 */
export async function extractTextFromImage(imageUrl: string): Promise<string> {
  try {
    const result = await generateText({
      model: openai('gpt-4o-mini'),
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Extract all visible text from this image. Return only the text content, preserving formatting where possible. If no text is visible, return an empty string.',
            },
            {
              type: 'image',
              image: imageUrl,
            },
          ],
        },
      ],
      maxTokens: 1000,
      temperature: 0.0, // Zero temperature for accurate OCR
    })

    return result.text.trim()
  } catch (error) {
    console.error('[Vision] Failed to extract text:', error)
    return ''
  }
}

/**
 * Analyze multiple images in batch
 */
export async function analyzeImages(imageUrls: string[]): Promise<VisionAnalysisResult[]> {
  const results = await Promise.all(imageUrls.map((url) => analyzeImage(url)))
  return results
}

/**
 * Save vision analysis to database
 */
export async function saveVisionAnalysis(
  attachmentId: string,
  analysis: VisionAnalysisResult
): Promise<boolean> {
  if (!analysis.description && !analysis.extractedText) {
    return false
  }

  try {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()

    const { error } = await supabase
      .from('message_attachments')
      .update({
        vision_description: analysis.description,
        extracted_text: analysis.extractedText || null,
      })
      .eq('id', attachmentId)

    if (error) {
      console.error('[Vision] Failed to save analysis:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('[Vision] Unexpected error saving analysis:', error)
    return false
  }
}

/**
 * Process image attachment with vision analysis
 */
export async function processImageAttachment(
  attachmentId: string,
  imageUrl: string
): Promise<VisionAnalysisResult> {
  // Analyze image
  const analysis = await analyzeImage(imageUrl)

  // Try to extract text if analysis succeeded
  if (analysis.description && !analysis.error) {
    const extractedText = await extractTextFromImage(imageUrl)
    if (extractedText) {
      analysis.extractedText = extractedText
    }
  }

  // Save to database
  await saveVisionAnalysis(attachmentId, analysis)

  return analysis
}
