import OpenAI from 'openai'

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/**
 * Analyze text and extract metadata (category, tags, emotions, location, date)
 */
export async function analyzeExperienceText(text: string, language: string = 'de') {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are an AI that analyzes user stories about extraordinary experiences.
Extract the following in JSON format:
- category: One of ["ufo", "paranormal", "dream", "synchronicity", "other"]
- tags: Array of relevant keywords (max 5)
- emotions: Array of emotions expressed (max 3)
- location: Extracted location if mentioned
- date: Extracted date if mentioned (ISO format)

Respond in ${language === 'de' ? 'German' : language}.`,
      },
      { role: 'user', content: text },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
  })

  return JSON.parse(completion.choices[0].message.content!)
}

/**
 * Transcribe audio to text using Whisper
 */
export async function transcribeAudio(audioFile: File) {
  const transcription = await openai.audio.transcriptions.create({
    file: audioFile,
    model: 'whisper-1',
    language: 'de', // Can be auto-detected
  })

  return transcription.text
}

/**
 * Generate embedding for text (1536 dimensions with text-embedding-3-small)
 *
 * Note: We use text-embedding-3-small instead of text-embedding-3-large because:
 * - Supabase pgvector 0.8.0 has a 2,000 dimension limit for indexes (IVFFlat & HNSW)
 * - text-embedding-3-large produces 3,072 dimensions (too large for indexed searches)
 * - text-embedding-3-small is cost-effective ($0.02/1M vs $0.13/1M tokens)
 * - For our dataset size (~111 experiences), the accuracy difference is negligible
 *
 * Future: When pgvector 0.9.0+ becomes available on Supabase (16,000 dim limit),
 * we can upgrade to text-embedding-3-large with dimensions reduced to 1536 for compatibility.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  })

  return response.data[0].embedding
}
