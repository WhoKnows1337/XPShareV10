import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { analyzeTextChanges } from '@/lib/utils/text-diff';

/**
 * Incremental Analysis API - Re-analyze edited text
 *
 * When users edit their experience text after initial analysis, this endpoint
 * performs smart re-analysis of only the changed content to:
 * - Update category if significantly changed
 * - Add/update relevant attributes
 * - Identify new questions that should be asked
 * - Preserve existing valid data
 *
 * This is more efficient than full re-analysis and preserves user work.
 */

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface IncrementalAnalysisRequest {
  originalText: string;
  editedText: string;
  currentCategory: string;
  currentAttributes: Record<string, { value: string; confidence: number }>;
  currentAnswers: Record<string, any>;
  language?: string;
}

export async function POST(request: NextRequest) {
  try {
    const data: IncrementalAnalysisRequest = await request.json();
    const {
      originalText,
      editedText,
      currentCategory,
      currentAttributes,
      currentAnswers,
      language = 'de',
    } = data;

    if (!originalText || !editedText) {
      return NextResponse.json(
        { error: 'Original and edited text are required' },
        { status: 400 }
      );
    }

    // Analyze the changes
    const textChange = analyzeTextChanges(originalText, editedText);

    // If changes are trivial, return current data unchanged
    if (textChange.severity === 'trivial') {
      return NextResponse.json({
        category: currentCategory,
        attributes: currentAttributes,
        changesDetected: textChange,
        reAnalysisPerformed: false,
        message: 'Changes too minor to require re-analysis',
      });
    }

    // Build prompt for incremental analysis
    const prompt = `Du analysierst Änderungen an einem Erfahrungsbericht und aktualisierst die Metadaten.

**Original-Text:**
"""
${originalText}
"""

**Bearbeiteter Text:**
"""
${editedText}
"""

**Aktuelle Kategorie:** ${currentCategory}

**Aktuelle Attribute:**
${JSON.stringify(currentAttributes, null, 2)}

**Änderungsübersicht:**
- Typ: ${textChange.type}
- Schweregrad: ${textChange.severity}
- Hinzugefügte Wörter: ${textChange.wordsAdded}
- Entfernte Wörter: ${textChange.wordsDeleted}

**Aufgabe:**
Analysiere die Änderungen und gib ein JSON-Objekt zurück mit:

1. **categoryChanged** (boolean): Hat sich die Kategorie geändert?
2. **newCategory** (string): Neue Kategorie falls geändert (UAP, Naturphänomen, Traum, Meditation, etc.)
3. **updatedAttributes** (object): NEUE oder GEÄNDERTE Attribute mit:
   - key: attribute name (shape, color, duration, witnesses, etc.)
   - value: string value
   - confidence: 0.0-1.0
   - reason: kurze Erklärung warum das Attribut aktualisiert wurde
4. **invalidatedAttributes** (string[]): Liste von Attribut-Keys die nicht mehr gelten
5. **newQuestionSuggestions** (string[]): Neue Fragen die aufgrund der Änderungen gestellt werden sollten

**Wichtige Regeln:**
- Nur Attribute zurückgeben die NEU sind oder sich GEÄNDERT haben
- Bestehende gültige Attribute NICHT wiederholen
- Kategorie nur ändern wenn WIRKLICH notwendig
- Confidence realistisch einschätzen

Gib NUR das JSON-Objekt zurück, keine zusätzlichen Erklärungen.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Du bist ein Experte für Erfahrungsberichte und analysierst Textänderungen.
Du gibst präzise, strukturierte JSON-Antworten zurück ohne zusätzlichen Text.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.2,
      max_tokens: 1500,
      response_format: { type: 'json_object' },
    });

    const analysisResult = JSON.parse(
      completion.choices[0].message.content || '{}'
    );

    // Build response with merged data
    const response: any = {
      changesDetected: textChange,
      reAnalysisPerformed: true,
      category: analysisResult.categoryChanged
        ? analysisResult.newCategory
        : currentCategory,
    };

    // Merge updated attributes with existing ones
    if (analysisResult.updatedAttributes) {
      response.attributes = { ...currentAttributes };

      // Add/update new attributes
      for (const [key, attrData] of Object.entries(
        analysisResult.updatedAttributes as Record<string, any>
      )) {
        response.attributes[key] = {
          value: attrData.value,
          confidence: attrData.confidence || 0.8,
        };
      }

      // Remove invalidated attributes
      if (analysisResult.invalidatedAttributes) {
        for (const key of analysisResult.invalidatedAttributes) {
          delete response.attributes[key];
        }
      }
    }

    // Include new question suggestions
    if (analysisResult.newQuestionSuggestions) {
      response.newQuestionSuggestions = analysisResult.newQuestionSuggestions;
    }

    // Metadata for debugging/logging
    response.meta = {
      categoryChanged: analysisResult.categoryChanged || false,
      attributesUpdated: Object.keys(analysisResult.updatedAttributes || {})
        .length,
      attributesInvalidated: (analysisResult.invalidatedAttributes || [])
        .length,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Incremental analysis error:', error);

    if (error?.status === 401 || error?.code === 'invalid_api_key') {
      return NextResponse.json(
        { error: 'OpenAI API key invalid or missing' },
        { status: 500 }
      );
    }

    if (error?.status === 429 || error?.code === 'rate_limit_exceeded') {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        error: 'Incremental analysis failed',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
