/**
 * Centralized prompt management for AI-powered Q&A
 * Maintains consistent prompts across the application
 */

import { Source } from '@/types/ai-answer'

/**
 * System prompt for RAG Q&A analyst
 * Optimized for experience analysis and pattern detection
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
