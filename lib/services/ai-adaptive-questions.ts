import OpenAI from 'openai'

export interface AdaptiveConditions {
  trigger_on?: string[] // Answer values that trigger AI generation
  trigger_keywords?: string[] // Keywords in text answers
  min_answer_length?: number // Minimum text length to trigger
  context_fields?: string[] // Fields to include in AI context
  max_questions?: number // Max follow-ups to generate
}

export interface QuestionContext {
  categoryName: string
  questionText: string
  answerValue: string | string[]
  previousAnswers?: Record<string, any>
  userProfile?: {
    experienceCount?: number
    expertise?: string
  }
}

export interface GeneratedQuestion {
  questionText: string
  reasoning: string
  suggestedType?: 'text' | 'chips' | 'boolean'
}

/**
 * AI-Adaptive Questions Service
 * Generates intelligent follow-up questions based on user answers
 */
export class AIAdaptiveQuestionsService {
  private openai: OpenAI | null = null

  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      })
    }
  }

  /**
   * Check if AI generation should be triggered based on conditions
   */
  shouldTriggerGeneration(
    answerValue: string | string[],
    conditions: AdaptiveConditions
  ): boolean {
    // Check if specific answer values trigger
    if (conditions.trigger_on) {
      const answers = Array.isArray(answerValue) ? answerValue : [answerValue]
      const hasMatch = answers.some(a =>
        conditions.trigger_on!.some(trigger =>
          a.toLowerCase().includes(trigger.toLowerCase())
        )
      )
      if (hasMatch) return true
    }

    // Check for keywords in text
    if (conditions.trigger_keywords && typeof answerValue === 'string') {
      const hasKeyword = conditions.trigger_keywords.some(keyword =>
        answerValue.toLowerCase().includes(keyword.toLowerCase())
      )
      if (hasKeyword) return true
    }

    // Check minimum text length
    if (conditions.min_answer_length && typeof answerValue === 'string') {
      if (answerValue.length >= conditions.min_answer_length) return true
    }

    return false
  }

  /**
   * Generate AI follow-up questions
   */
  async generateFollowUpQuestions(
    context: QuestionContext,
    conditions: AdaptiveConditions
  ): Promise<GeneratedQuestion[]> {
    if (!this.openai) {
      throw new Error('OpenAI API key not configured')
    }

    const maxQuestions = conditions.max_questions || 1

    const systemPrompt = `You are an expert in paranormal research and experience documentation. Your role is to generate insightful follow-up questions that help users provide more detailed and valuable information about their paranormal experiences.

Guidelines:
- Ask specific, relevant follow-up questions based on the user's answer
- Focus on details that would help understand the experience better
- Keep questions clear and concise
- Avoid yes/no questions when possible
- Be respectful and non-judgmental
- Generate ${maxQuestions} follow-up question(s)`

    const userPrompt = `Category: ${context.categoryName}
Original Question: ${context.questionText}
User's Answer: ${JSON.stringify(context.answerValue)}
${context.previousAnswers ? `Previous Answers: ${JSON.stringify(context.previousAnswers)}` : ''}
${context.userProfile ? `User Experience Level: ${context.userProfile.experienceCount || 0} experiences shared` : ''}

Generate ${maxQuestions} intelligent follow-up question(s) that would help gather more meaningful details about this experience. Return as JSON array with format:
[
  {
    "questionText": "The follow-up question",
    "reasoning": "Why this question is relevant",
    "suggestedType": "text" | "chips" | "boolean"
  }
]`

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 500,
        response_format: { type: 'json_object' },
      })

      const response = completion.choices[0]?.message?.content
      if (!response) {
        throw new Error('No response from OpenAI')
      }

      const parsed = JSON.parse(response)

      // Handle both array and object with questions array
      const questions = Array.isArray(parsed) ? parsed : (parsed.questions || [])

      return questions.slice(0, maxQuestions)
    } catch (error) {
      console.error('AI generation error:', error)
      throw error
    }
  }

  /**
   * Generate context-aware prompt for experience submission
   */
  async generateContextualPrompt(
    categoryName: string,
    previousAnswers: Record<string, any>
  ): Promise<string> {
    if (!this.openai) {
      return 'Please provide additional details about your experience.'
    }

    const systemPrompt = `You are helping users document paranormal experiences. Generate a brief, encouraging prompt (1-2 sentences) that helps them elaborate on their experience based on what they've shared so far.`

    const userPrompt = `Category: ${categoryName}
Answers so far: ${JSON.stringify(previousAnswers)}

Generate a brief, encouraging prompt to help them share more details.`

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 100,
      })

      return completion.choices[0]?.message?.content || 'Please provide additional details.'
    } catch (error) {
      console.error('Prompt generation error:', error)
      return 'Please provide additional details about your experience.'
    }
  }

  /**
   * Analyze answer quality and suggest improvements
   */
  async analyzeAnswerQuality(
    questionText: string,
    answerText: string
  ): Promise<{
    score: number
    suggestions: string[]
    needsFollowUp: boolean
  }> {
    if (!this.openai) {
      return {
        score: 3,
        suggestions: [],
        needsFollowUp: false,
      }
    }

    const systemPrompt = `You analyze the quality of paranormal experience descriptions. Rate the answer on a scale of 1-5 and provide suggestions for improvement if needed.`

    const userPrompt = `Question: ${questionText}
Answer: ${answerText}

Analyze the quality and completeness of this answer. Return JSON:
{
  "score": 1-5,
  "suggestions": ["suggestion1", "suggestion2"],
  "needsFollowUp": true/false
}`

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 200,
        response_format: { type: 'json_object' },
      })

      const response = completion.choices[0]?.message?.content
      if (!response) throw new Error('No response')

      return JSON.parse(response)
    } catch (error) {
      console.error('Quality analysis error:', error)
      return {
        score: 3,
        suggestions: [],
        needsFollowUp: false,
      }
    }
  }
}

// Singleton instance
export const aiAdaptiveService = new AIAdaptiveQuestionsService()
