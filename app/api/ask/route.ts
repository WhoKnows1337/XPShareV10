import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateEmbedding, openai } from '@/lib/openai/client'

/**
 * RAG Q&A System API
 *
 * Uses GPT-4o to answer questions about experiences
 * based on semantic search results (Retrieval-Augmented Generation)
 *
 * POST /api/ask
 * Body: {
 *   question: string,
 *   maxSources?: number (default: 15)
 * }
 */

export async function POST(req: NextRequest) {
  const startTime = Date.now()

  try {
    const {
      question,
      maxSources = 15,
      category,
      tags,
      location,
      dateFrom,
      dateTo,
      witnessesOnly
    } = await req.json()

    // Validation
    if (!question || typeof question !== 'string' || question.trim().length < 5) {
      return NextResponse.json(
        { error: 'Question must be at least 5 characters long' },
        { status: 400 }
      )
    }

    // Step 1: Generate embedding for the question
    let queryEmbedding: number[]
    try {
      queryEmbedding = await generateEmbedding(question)
    } catch (embeddingError: any) {
      console.error('Embedding generation error:', embeddingError)
      return NextResponse.json(
        { error: 'Failed to generate question embedding', details: embeddingError.message },
        { status: 500 }
      )
    }

    // Step 2: Find relevant experiences using vector similarity with filters
    const supabase = await createClient()

    // Build query with filters
    let query = supabase
      .from('experiences')
      .select('id, title, story_text, category, date_occurred, location_text, tags, witness_count, embedding')
      .eq('visibility', 'public')
      .not('embedding', 'is', null)

    // Apply filters
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    if (dateFrom) {
      query = query.gte('date_occurred', dateFrom)
    }

    if (dateTo) {
      query = query.lte('date_occurred', dateTo)
    }

    if (witnessesOnly) {
      query = query.gt('witness_count', 0)
    }

    const { data: relevant, error: searchError } = await query.limit(50)

    if (searchError) {
      console.error('Search error:', searchError)
      throw searchError
    }

    if (!relevant || relevant.length === 0) {
      return NextResponse.json({
        answer: 'Ich konnte keine relevanten Erfahrungen zu deiner Frage finden.',
        sources: [],
        confidence: 0,
        totalSources: 0,
      })
    }

    // Calculate similarities and sort
    // Apply client-side filters for tags and location
    let filteredRelevant = relevant || []

    if (tags) {
      const tagList = tags.split(',').map((t: string) => t.trim().toLowerCase())
      filteredRelevant = filteredRelevant.filter((exp: any) =>
        exp.tags?.some((tag: string) => tagList.includes(tag.toLowerCase()))
      )
    }

    if (location) {
      filteredRelevant = filteredRelevant.filter((exp: any) =>
        exp.location_text?.toLowerCase().includes(location.toLowerCase())
      )
    }

    const withSimilarity = filteredRelevant
      .map((exp: any) => {
        if (!exp.embedding) return null

        // Cosine similarity calculation
        const expEmbedding = JSON.parse(exp.embedding)
        let dotProduct = 0
        let normA = 0
        let normB = 0

        for (let i = 0; i < queryEmbedding.length; i++) {
          dotProduct += queryEmbedding[i] * expEmbedding[i]
          normA += queryEmbedding[i] * queryEmbedding[i]
          normB += expEmbedding[i] * expEmbedding[i]
        }

        const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))

        return {
          ...exp,
          similarity,
        }
      })
      .filter((exp): exp is NonNullable<typeof exp> => exp !== null && exp.similarity > 0.3)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, maxSources)

    if (withSimilarity.length === 0) {
      return NextResponse.json({
        answer: 'Ich konnte keine relevanten Erfahrungen zu deiner Frage finden. Versuche es mit einer anderen Formulierung.',
        sources: [],
        confidence: 0,
        totalSources: 0,
      })
    }

    // Step 3: Build context from experiences
    const context = withSimilarity
      .map((exp: any, i: number) => {
        return `[Erfahrung #${i + 1} - ID: ${exp.id}]
Titel: ${exp.title || 'Ohne Titel'}
Kategorie: ${exp.category || 'Unbekannt'}
Datum: ${exp.date_occurred || 'Unbekannt'}
Ort: ${exp.location_text || 'Unbekannt'}
Relevanz: ${Math.round(exp.similarity * 100)}%

${(exp.story_text || '').substring(0, 600)}${exp.story_text?.length > 600 ? '...' : ''}

---`
      })
      .join('\n\n')

    // Step 4: Generate answer with GPT-4o
    let answer = ''

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `Du bist ein Analyst für außergewöhnliche Erfahrungen. Beantworte Fragen basierend auf echten Erfahrungsberichten aus unserer Datenbank.

**WICHTIG:**
- Antworte NUR basierend auf den bereitgestellten Erfahrungen
- Zitiere spezifische Erfahrungen mit [Erfahrung #X]
- Wenn die Daten nicht ausreichen, sage es ehrlich
- Identifiziere Muster und Gemeinsamkeiten
- Nutze Statistiken wenn möglich (z.B. "In 8 von 15 Berichten...")
- Antworte auf Deutsch, klar und strukturiert
- Gib konkrete Beispiele und Zitate aus den Berichten`,
          },
          {
            role: 'user',
            content: `ERFAHRUNGSBERICHTE:
${context}

FRAGE: ${question}

Antworte strukturiert und präzise.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      })

      answer = completion.choices[0].message.content || 'Keine Antwort generiert.'
    } catch (gptError: any) {
      console.error('GPT-4o API error:', gptError)
      // Fallback to a simple response
      answer = `Basierend auf ${withSimilarity.length} relevanten Erfahrungsberichten:\n\n${withSimilarity
        .slice(0, 3)
        .map((exp: any, i: number) => `${i + 1}. **${exp.title}** (${exp.category})\n${exp.story_text?.substring(0, 200)}...`)
        .join('\n\n')}`
    }

    // Step 5: Calculate confidence score
    const avgSimilarity = withSimilarity.reduce((sum, exp) => sum + exp.similarity, 0) / withSimilarity.length
    const confidence = Math.min(Math.round(avgSimilarity * 100), 100)

    const executionTime = Date.now() - startTime

    // Step 6: Track Q&A analytics
    const {
      data: { user },
    } = await (supabase as any).auth.getUser()

    try {
      await (supabase as any).rpc('track_search', {
        p_query_text: question,
        p_user_id: user?.id || null,
        p_result_count: withSimilarity.length,
        p_search_type: 'qa',
        p_filters: {
          maxSources,
          category,
          tags,
          location,
          dateRange: dateFrom || dateTo ? { from: dateFrom, to: dateTo } : null,
          witnessesOnly,
        },
        p_language: 'de',
        p_execution_time_ms: executionTime,
      })
    } catch (trackError) {
      console.warn('Failed to track Q&A:', trackError)
    }

    return NextResponse.json({
      answer,
      sources: withSimilarity.map((exp: any) => ({
        id: exp.id,
        title: exp.title,
        category: exp.category,
        similarity: exp.similarity,
        date_occurred: exp.date_occurred,
        location_text: exp.location_text,
      })),
      confidence,
      totalSources: withSimilarity.length,
      meta: {
        question,
        executionTime,
        model: 'gpt-4o',
        avgSimilarity,
      },
    })
  } catch (error: any) {
    console.error('RAG Q&A error:', error)

    return NextResponse.json(
      {
        error: 'Q&A failed',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
