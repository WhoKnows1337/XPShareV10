/**
 * Centralized prompt management for AI-powered Q&A
 * Maintains consistent prompts across the application
 *
 * Search 5.0: Pattern Discovery with Multi-Turn Conversation Support
 */

import { Source } from '@/types/ai-answer'
import { Pattern, Search5Response } from '@/types/search5'

/**
 * DEPRECATED: Legacy RAG System Prompt (for backward compatibility)
 * Use PATTERN_DISCOVERY_SYSTEM_PROMPT for Search 5.0
 */
export const RAG_SYSTEM_PROMPT = `Du bist ein Analyst für außergewöhnliche Erfahrungen auf XPShare. Beantworte Fragen basierend auf echten Erfahrungsberichten aus unserer Datenbank.

**WICHTIG:**
- Antworte NUR basierend auf den bereitgestellten Erfahrungen
- Zitiere spezifische Erfahrungen mit [Erfahrung #X]
- Wenn die Daten nicht ausreichen, sage es ehrlich
- Identifiziere Muster und Gemeinsamkeiten
- Nutze Statistiken wenn möglich (z.B. "In 8 von 15 Berichten...")
- Antworte auf Deutsch, klar und strukturiert
- Gib konkrete Beispiele und Zitate aus den Berichten

**ANALYSE-ANSATZ:**
1. Verstehe die Frage und analysiere die Intention
2. Untersuche alle relevanten Erfahrungen sorgfältig
3. Erkenne Muster (Formen, Farben, Verhaltensweisen, Orte, Zeiten)
4. Strukturiere deine Antwort logisch mit klaren Abschnitten
5. Zitiere Quellen mit [Erfahrung #X] direkt im Text
6. Biete tiefergehende Einblicke durch Statistiken

**MUSTER-TYPEN:**
- Häufigkeit: Wie oft treten bestimmte Merkmale auf?
- Geografisch: Gibt es Cluster an bestimmten Orten?
- Zeitlich: Muster über Zeit oder Tageszeit?
- Kategorisch: Verteilung über Kategorien
- Verhaltensweisen: Gemeinsame Phänomene oder Reaktionen

**ERFAHRUNGS-REFERENZEN:**
- Verwende [Erfahrung #X] für wichtige Beispiele
- Zeige relevante Kontexte und Zitate
- Verlinke ähnliche Erfahrungen wenn passend`

/**
 * Search 5.0: Pattern Discovery System Prompt
 * Optimized for structured pattern extraction with OpenAI JSON Schema
 */
export const PATTERN_DISCOVERY_SYSTEM_PROMPT = `Du bist ein Pattern Discovery Assistant für außergewöhnliche Erfahrungen.

Deine Aufgabe:
1. Analysiere die bereitgestellten Erfahrungen
2. Identifiziere 2-4 klare PATTERNS (Muster)
3. Jedes Pattern muss haben:
   - Typ (color/temporal/behavior/location/attribute)
   - Titel (prägnant)
   - Finding (ein Satz mit Zahlen/Prozenten)
   - Strukturierte Daten für Visualisierung
   - Source IDs

Pattern-Typen:
- color: Farben die häufig vorkommen (z.B. "Orange UFOs")
- temporal: Zeitliche Muster (Jahreszeit, Monat, Tageszeit)
- behavior: Verhaltensweisen (lautlos, schwebend, plötzliches Verschwinden)
- location: Geografische Cluster (Bodensee, bestimmte Regionen)
- attribute: Tags/Kategorien die korrelieren

Wichtig:
- NUR Patterns die in >= 30% der Quellen vorkommen
- Zahlen MÜSSEN korrekt sein (count aus sources)
- Findings müssen verifizierbar sein
- Verwende sourceIds Array um Quellen zu referenzieren
- Confidence Score: 0-100 basierend auf Pattern-Stärke

Beispiel Finding:
"Orange wird in 12 von 15 Sichtungen (80%) als Hauptfarbe berichtet"

Output Format:
JSON mit patterns[], serendipity (optional), metadata`

/**
 * Build context from experiences for RAG
 */
export function buildContextFromExperiences(experiences: Source[]): string {
  return experiences
    .map((exp, i) => {
      return `[Erfahrung #${i + 1} - ID: ${exp.id}]
Titel: ${exp.title || 'Ohne Titel'}
Kategorie: ${exp.category || 'Unbekannt'}
Datum: ${exp.date_occurred || 'Unbekannt'}
Ort: ${exp.location_text || 'Unbekannt'}
Relevanz: ${Math.round(exp.similarity * 100)}%

${(exp.fullText || exp.excerpt || '').substring(0, 600)}${
        (exp.fullText || exp.excerpt || '').length > 600 ? '...' : ''
      }

---`
    })
    .join('\n\n')
}

/**
 * Build user message with context and question
 */
export function buildUserMessage(question: string, context: string): string {
  return `ERFAHRUNGSBERICHTE:
${context}

FRAGE: ${question}

Antworte strukturiert und präzise. Nutze [Erfahrung #X] um auf spezifische Berichte zu verweisen.`
}

/**
 * Validate and sanitize user question
 */
export function sanitizeQuestion(question: string): string {
  // Remove excessive whitespace
  let cleaned = question.trim().replace(/\s+/g, ' ')

  // Remove potentially malicious content
  cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  cleaned = cleaned.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')

  return cleaned
}

/**
 * Search 5.0: Build pattern discovery prompt with sources
 * Used for structured pattern extraction with OpenAI JSON Schema
 */
export function buildPatternDiscoveryPrompt(question: string, sources: Source[]): string {
  const sourceList = sources.map((s, i) =>
    `[${i+1}] ${s.title} | Category: ${s.category} | Date: ${s.date_occurred || 'Unknown'} | Location: ${s.location_text || 'Unknown'}
${(s.fullText || s.excerpt || '').substring(0, 300)}...`
  ).join('\n\n')

  return `Frage: ${question}

Verfügbare Quellen (${sources.length}):
${sourceList}

Analysiere diese Quellen und extrahiere 2-4 klare Patterns.
Fokus: Was verbindet diese Erfahrungen? Welche Gemeinsamkeiten fallen auf?`
}

/**
 * Search 5.0: Build conversational prompt for multi-turn dialogue
 * Includes conversation history for context-aware pattern discovery
 *
 * @param currentQuery - Current user question
 * @param sources - Matched experience sources
 * @param conversationHistory - Previous turns (max 3)
 * @param previousPatterns - All patterns found in conversation so far
 */
export function buildConversationalPrompt(
  currentQuery: string,
  sources: Source[],
  conversationHistory?: Array<{ query: string; patterns: Pattern[] }>,
  previousPatterns?: Pattern[]
): string {
  const conversationDepth = conversationHistory?.length || 0

  if (conversationDepth === 0) {
    // First turn - standard pattern discovery prompt
    return buildPatternDiscoveryPrompt(currentQuery, sources)
  }

  // Multi-turn prompt with context awareness
  const contextSummary = conversationHistory!.map((turn, i) => `
Turn ${i + 1} Query: "${turn.query}"
Found Patterns: ${turn.patterns.map(p => p.type).join(', ')}
`).join('\n')

  const exploredPatternTypes = [...new Set(previousPatterns?.map(p => p.type) || [])]

  const sourceList = sources.map((s, i) =>
    `[${i+1}] ${s.title} | Category: ${s.category} | Date: ${s.date_occurred || 'Unknown'} | Location: ${s.location_text || 'Unknown'}
${(s.fullText || s.excerpt || '').substring(0, 300)}...`
  ).join('\n\n')

  return `You are analyzing experiences in a multi-turn conversation (Turn ${conversationDepth + 1}).

**Conversation Context**:
${contextSummary}

**Previous Pattern Types Explored**:
${exploredPatternTypes.join(', ')}

**Current Query**: "${currentQuery}"

**Available Sources (${sources.length})**:
${sourceList}

**Instructions**:
1. Consider the conversation flow - is the user:
   - Refining previous query? → Focus on similar patterns with adjusted parameters
   - Pivoting to new topic? → Provide fresh perspective
   - Asking follow-up? → Reference previous findings ("As seen in UFO pattern...")

2. Avoid repeating exact patterns from previous turns
3. If query references previous results ("show more like..."), prioritize those pattern types
4. Maintain conversation coherence while discovering new insights

Generate 2-4 new patterns now.`
}

/**
 * Generate follow-up questions based on answer context
 * (Future: AI will generate these)
 */
export function suggestFollowUpQuestions(
  question: string,
  category?: string
): string[] {
  const baseQuestions = [
    'Gibt es zeitliche Muster bei diesen Erfahrungen?',
    'Welche geografischen Cluster sind erkennbar?',
    'Wie unterscheiden sich die Berichte in verschiedenen Kategorien?',
  ]

  // Category-specific questions
  const categoryQuestions: Record<string, string[]> = {
    ufo: [
      'Welche Formen werden am häufigsten beschrieben?',
      'Gibt es Berichte mit mehreren Zeugen?',
      'Zu welcher Tageszeit treten die meisten Sichtungen auf?',
    ],
    nde: [
      'Welche gemeinsamen Elemente gibt es in Nahtoderfahrungen?',
      'Wie beschreiben Menschen das Zeitgefühl?',
      'Welche Emotionen werden am häufigsten berichtet?',
    ],
    psychedelics: [
      'Welche Substanzen wurden verwendet?',
      'Wie lange dauerten die Erfahrungen?',
      'Welche Muster gibt es in den visuellen Erfahrungen?',
    ],
    'lucid-dream': [
      'Welche Techniken wurden für luzides Träumen verwendet?',
      'Wie lange dauert es, bis Kontrolle erlangt wird?',
      'Welche Aktivitäten werden im luziden Traum ausgeführt?',
    ],
    meditation: [
      'Welche Meditationstechniken wurden praktiziert?',
      'Wie lange wurde meditiert?',
      'Welche körperlichen Empfindungen wurden berichtet?',
    ],
  }

  if (category && categoryQuestions[category]) {
    return categoryQuestions[category]
  }

  return baseQuestions
}
