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
 * Updated with follow-up question generation
 */
export const PATTERN_DISCOVERY_SYSTEM_PROMPT = `Du bist ein Pattern Discovery Assistant für außergewöhnliche Erfahrungen.

Deine Aufgabe:
1. Erstelle eine SUMMARY (Zusammenfassung):
   - Natürliche Sprache, 2-4 Sätze
   - Beantworte die Nutzerfrage direkt
   - Integriere konkrete Zahlen und Prozente
   - Schreibe flüssig und lesbar (nicht stichwortartig)
   - Beispiel: "Die häufigsten Farben in UFO-Sichtungen sind multicolor Lichter (33%), gefolgt von grün (20%) und orange (13%). Besonders interessant: Berlin und London sind mit je 3 Sichtungen (20%) die häufigsten Orte."

2. Analysiere die bereitgestellten Erfahrungen
3. Identifiziere 2-4 klare PATTERNS (Muster)
4. Generiere 3-5 FOLLOW-UP QUESTIONS basierend auf den Patterns
5. Jedes Pattern muss haben:
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

Follow-Up Questions Regeln:
- Generiere 3-5 interessante Follow-up Fragen basierend auf den entdeckten Patterns
- Fragen sollten tiefer in spezifische Patterns eintauchen
- Ermutige cross-category Exploration (z.B. "Gibt es einen Zusammenhang zwischen Farbe und Tageszeit?")
- Fragen sollten konkret und beantwortbar sein
- Jede Frage braucht eine "reason" (warum ist das interessant?)
- Kategorisiere Fragen nach Typ (color/temporal/behavior/location/attribute/cross-category)

Beispiel Follow-Up:
{
  "question": "Gibt es einen Zusammenhang zwischen orangen UFOs und der Tageszeit?",
  "category": "cross-category",
  "reason": "Das Farbmuster könnte durch atmosphärische Bedingungen zu bestimmten Tageszeiten erklärt werden"
}

Output Format:
JSON mit summary (string), patterns[], followUpSuggestions[]`

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
    `[${i+1}] ID: ${s.id} | ${s.title} | Category: ${s.category} | Date: ${s.date_occurred || 'Unknown'} | Location: ${s.location_text || 'Unknown'}
${(s.fullText || s.excerpt || '').substring(0, 300)}...`
  ).join('\n\n')

  return `Frage: ${question}

Verfügbare Quellen (${sources.length}):
${sourceList}

Analysiere diese Quellen und extrahiere 2-4 klare Patterns.
Fokus: Was verbindet diese Erfahrungen? Welche Gemeinsamkeiten fallen auf?

WICHTIG: Verwende für sourceIds die ID-Werte (UUIDs) aus den Quellen, NICHT die Nummern [1], [2], etc.`
}

/**
 * Search 5.0: Build conversational prompt for multi-turn dialogue
 * Enhanced with richer context and conversation flow detection
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

  // Build rich context summary with key findings
  const contextSummary = conversationHistory!.map((turn, i) => {
    const topPatterns = turn.patterns
      .sort((a, b) => (b.confidence || 0) - (a.confidence || 0))
      .slice(0, 2)
      .map(p => `${p.type}: "${p.title}" (${p.confidence}% conf)`)
      .join(', ')

    return `Turn ${i + 1}: "${turn.query}"
   → Key Findings: ${topPatterns || 'No patterns found'}
   → ${turn.patterns.length} patterns discovered`
  }).join('\n')

  // Detect conversation flow type
  const lastQuery = conversationHistory![conversationHistory!.length - 1]?.query.toLowerCase()
  const currentQueryLower = currentQuery.toLowerCase()
  const flowType = detectConversationFlow(lastQuery, currentQueryLower, previousPatterns)

  // Group patterns by type for better context
  const patternTypeStats: Record<string, number> = {}
  previousPatterns?.forEach(p => {
    patternTypeStats[p.type] = (patternTypeStats[p.type] || 0) + 1
  })
  const exploredStats = Object.entries(patternTypeStats)
    .map(([type, count]) => `${type} (${count}x)`)
    .join(', ')

  // Get pattern details for cross-referencing
  const keyPreviousPatterns = previousPatterns
    ?.sort((a, b) => (b.confidence || 0) - (a.confidence || 0))
    .slice(0, 3)
    .map(p => `• ${p.type}: "${p.title}" - ${p.finding}`)
    .join('\n') || 'None yet'

  const sourceList = sources.map((s, i) =>
    `[${i+1}] ID: ${s.id} | ${s.title} | Category: ${s.category} | Date: ${s.date_occurred || 'Unknown'} | Location: ${s.location_text || 'Unknown'}
${(s.fullText || s.excerpt || '').substring(0, 300)}...`
  ).join('\n\n')

  return `You are analyzing experiences in a multi-turn conversation (Turn ${conversationDepth + 1}).

**Conversation History**:
${contextSummary}

**Pattern Types Already Explored**:
${exploredStats}

**Top 3 Previous Discoveries** (for reference/comparison):
${keyPreviousPatterns}

**Current Query**: "${currentQuery}"
**Detected Flow Type**: ${flowType}

**Available Sources (${sources.length})**:
${sourceList}

**Context-Aware Instructions**:

${getFlowSpecificInstructions(flowType)}

**Cross-Turn Analysis Guidelines**:
1. When user refines query, build upon previous findings:
   - Compare/contrast with earlier patterns
   - Show progression or changes
   - Example: "While earlier we found X, now with refined focus we see Y..."

2. When user pivots to new topic:
   - Acknowledge the shift
   - Find connections to previous discoveries if relevant
   - Example: "Shifting from temporal to geographic patterns..."

3. When user asks follow-up:
   - Explicitly reference previous patterns
   - Use pattern IDs or titles from earlier turns
   - Example: "Building on the orange color pattern from Turn 1..."

4. Pattern Diversity:
   - Avoid exact repetition of previous pattern findings
   - If same type (e.g., color), find different aspects
   - Prioritize unexplored pattern types when possible

5. Confidence Calibration:
   - If patterns weaken with refinement, reflect that in confidence scores
   - If patterns strengthen, increase confidence

Generate 2-4 new patterns that advance the conversation.`
}

/**
 * Detect conversation flow type from query evolution
 */
function detectConversationFlow(
  previousQuery: string,
  currentQuery: string,
  previousPatterns?: Pattern[]
): string {
  if (!previousQuery) return 'Initial Query'

  // Detect refinement (adds specificity)
  const refinementKeywords = ['genauer', 'spezifisch', 'nur', 'welche von', 'davon']
  if (refinementKeywords.some(kw => currentQuery.includes(kw))) {
    return 'Refinement (adding specificity)'
  }

  // Detect follow-up (references previous)
  const followUpKeywords = ['mehr', 'andere', 'weitere', 'ähnliche', 'auch']
  if (followUpKeywords.some(kw => currentQuery.includes(kw))) {
    return 'Follow-Up (exploring similar)'
  }

  // Detect pivot (completely different pattern type)
  const previousTypes = new Set(previousPatterns?.map(p => p.type) || [])
  const currentMentionsNewType =
    (currentQuery.includes('zeit') && !previousTypes.has('temporal')) ||
    (currentQuery.includes('ort') && !previousTypes.has('location')) ||
    (currentQuery.includes('farbe') && !previousTypes.has('color'))

  if (currentMentionsNewType) {
    return 'Pivot (exploring different dimension)'
  }

  // Detect broadening (removes constraints)
  const broadeningKeywords = ['allgemein', 'insgesamt', 'überall', 'alle']
  if (broadeningKeywords.some(kw => currentQuery.includes(kw))) {
    return 'Broadening (removing constraints)'
  }

  // Default: continuation
  return 'Continuation (exploring related aspects)'
}

/**
 * Get flow-specific instructions for the LLM
 */
function getFlowSpecificInstructions(flowType: string): string {
  switch (true) {
    case flowType.startsWith('Refinement'):
      return `This is a REFINEMENT query. The user wants more specific insights:
- Narrow down previous findings with added constraints
- Show how patterns change with refinement
- Maintain connection to broader patterns from previous turns
- Use phrases like "When focusing on [constraint], we see..."`

    case flowType.startsWith('Follow-Up'):
      return `This is a FOLLOW-UP query. The user wants to explore similar territory:
- Find patterns similar to previous discoveries
- Show variations or extensions of existing patterns
- Reference specific previous findings explicitly
- Use phrases like "Similar to [previous pattern], we also find..."`

    case flowType.startsWith('Pivot'):
      return `This is a PIVOT query. The user is exploring a new dimension:
- Provide fresh perspective on different aspect
- Look for connections to previous findings if natural
- Avoid forcing references to unrelated previous patterns
- Use phrases like "Shifting focus to [new aspect]..."`

    case flowType.startsWith('Broadening'):
      return `This is a BROADENING query. The user wants the bigger picture:
- Show how patterns generalize when constraints are removed
- Compare specific vs. general findings
- Aggregate insights from previous turns if relevant
- Use phrases like "Expanding beyond [previous constraint], we observe..."`

    default:
      return `This is a CONTINUATION query. Maintain conversation coherence:
- Build naturally on the conversation flow
- Reference previous findings when relevant
- Discover new insights that complement earlier patterns
- Keep the analytical narrative consistent`
  }
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
