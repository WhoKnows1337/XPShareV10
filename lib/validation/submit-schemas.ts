import { z } from 'zod';
import validator from 'validator';

// ============================================================
// COMMON VALIDATION SCHEMAS
// ============================================================

// Email validation
export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Invalid email format")
  .refine((email) => validator.isEmail(email, {
    allow_utf8_local_part: false,
    require_tld: true
  }), "Invalid email address");

// Coordinate validation
export const coordinateSchema = z.object({
  lat: z.number().min(-90).max(90).nullable().optional(),
  lng: z.number().min(-180).max(180).nullable().optional(),
});

// File validation schema
export const fileSchema = z.object({
  name: z.string().min(1).max(255),
  size: z.number().min(1).max(10 * 1024 * 1024), // Max 10MB
  type: z.enum(['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'audio/mpeg', 'audio/wav', 'video/mp4', 'video/quicktime']),
  url: z.string().url().optional(),
});

// Witness validation
export const witnessSchema = z.object({
  name: z.string().min(1).max(100),
  email: emailSchema.optional(),
  userId: z.string().uuid().optional(),
}).refine(
  (data) => data.email || data.userId,
  "Either email or userId must be provided"
);

// Attribute value validation with sanitization
export const attributeValueSchema = z.string()
  .min(1)
  .max(500)
  .transform((val) => {
    // Sanitize to prevent XSS/injection
    return val
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]+>/g, '') // Remove all HTML tags
      .trim();
  });

// Category enum matching your database and translations
export const categorySchema = z.enum([
  // Original categories
  'glitch-in-matrix',
  'time-slip',
  'telepathic',
  'precognitive-dream',
  'synchronicity',
  'out-of-body',
  'near-death',
  'ufo-sighting',
  'paranormal',
  'cryptid',
  'past-life',
  'shared-dream',
  'premonition',
  'psychokinesis',
  'apparition',
  'other',
  // New categories from translations
  'consciousness-inner',
  'cryptid_encounter',
  'dreams',
  'entities-apparitions',
  'extraterrestrial-sky',
  'gesundheit',
  'ghost-spirit',
  'nde',
  'nde-obe',
  'near_death_experience',
  'psychedelic',
  'psychic_experience',
  'spiritual',
  'spiritual_experience',
  'time-space-sync',
  'ufo-uap',
]);

// ============================================================
// API ROUTE SCHEMAS
// ============================================================

// POST /api/submit/analyze - Screen 1 -> 2
export const analyzeSchema = z.object({
  text: z
    .string()
    .min(50, "Text must be at least 50 characters")
    .max(50000, "Text cannot exceed 50,000 characters")
    .transform((text) => text.trim()),
  language: z.string().length(2).default('en').optional(),
});

// POST /api/submit/analyze-complete - Advanced Analysis
export const analyzeCompleteSchema = z.object({
  text: z
    .string()
    .min(30, "Text must be at least 30 characters")
    .max(50000, "Text cannot exceed 50,000 characters"),
  language: z.string().length(2).default('en'),
  category: categorySchema.optional(),
  existingAttributes: z.record(z.string(), attributeValueSchema).optional(),
});

// POST /api/submit/enrich-text - Screen 3
export const enrichTextSchema = z.object({
  text: z.string().min(30).max(50000),
  attributes: z.record(z.string(), z.object({
    value: attributeValueSchema,
    confidence: z.number().min(0).max(1),
    isManuallyEdited: z.boolean().default(false),
  })),
  answers: z.array(z.object({
    id: z.string(),
    question: z.string(),
    answer: z.union([
      z.string(),
      z.number(),
      z.boolean(),
      z.array(z.string()),
    ]).nullable(),
    type: z.enum(['text', 'number', 'boolean', 'select', 'multiselect', 'date']),
  })).optional(),
  language: z.string().length(2).default('en'),
});

// POST /api/submit/publish - Final submission
export const publishSchema = z.object({
  // Screen 1 data
  text: z.string().min(50).max(50000),

  // Screen 2 data
  title: z.string().min(3).max(200),
  category: categorySchema,
  tags: z.array(z.string().min(1).max(50))
    .max(10, "Maximum 10 tags allowed")
    .transform((tags) => [...new Set(tags)]), // Remove duplicates

  // Date/Time/Location
  dateOccurred: z.string().datetime().nullable().optional(),
  timeOfDay: z.enum(['morning', 'afternoon', 'evening', 'night', 'unknown']).nullable().optional(),
  duration: z.enum(['instant', 'seconds', 'minutes', 'hours', 'days', 'recurring']).nullable().optional(),
  location: z.string().max(500).nullable().optional(),
  locationLat: z.number().min(-90).max(90).nullable().optional(),
  locationLng: z.number().min(-180).max(180).nullable().optional(),

  // Attributes with sanitization
  attributes: z.record(z.string(), z.object({
    value: attributeValueSchema,
    confidence: z.number().min(0).max(1),
    isManuallyEdited: z.boolean(),
    customValue: attributeValueSchema.nullable().optional(),
  })).optional(),

  // Questions & Answers
  questionAnswers: z.array(z.object({
    id: z.string(),
    question: z.string(),
    answer: z.any(),
    type: z.string(),
  })).optional(),

  // Screen 3 data
  enhancedText: z.string().max(100000).optional(),
  enhancementEnabled: z.boolean().default(false),
  summary: z.string().max(1000).optional(),

  // Screen 4 data
  mediaUrls: z.array(z.string().url()).max(10).optional(), // Backwards compatibility
  media: z.array(z.object({
    url: z.string().url(),
    duration: z.number().min(0).max(86400).optional(), // Max 24 hours in seconds
    width: z.number().min(1).max(10000).optional(),
    height: z.number().min(1).max(10000).optional(),
  })).max(10).optional(),
  witnesses: z.array(witnessSchema).max(5).optional(),
  externalLinks: z.array(z.object({
    url: z.string().url(),
    platform: z.enum([
      'youtube', 'vimeo', 'twitter', 'spotify', 'soundcloud',
      'tiktok', 'instagram', 'facebook', 'maps', 'website'
    ]),
    title: z.string().max(500).optional(),
    description: z.string().max(2000).optional(),
    thumbnail_url: z.string().url().optional(),
    author_name: z.string().max(200).optional(),
    author_url: z.string().url().optional(),
    provider_name: z.string().max(100).optional(),
    provider_url: z.string().url().optional(),
    html: z.string().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
    duration: z.number().optional(),
  })).max(20).optional(),
  visibility: z.enum(['public', 'anonymous', 'private']).default('public'),

  // Metadata
  language: z.string().length(2).default('en'),
  aiEnhancementUsed: z.boolean().default(false),
  userEditedAi: z.boolean().default(false),
  enhancementModel: z.string().optional(),
});

// POST /api/submit/upload - File upload validation
export const uploadSchema = z.object({
  files: z.array(fileSchema).min(1).max(10, "Maximum 10 files allowed"),
  experienceId: z.string().uuid().optional(), // For updates
});

// POST /api/submit/generate-questions
export const generateQuestionsSchema = z.object({
  category: categorySchema,
  attributes: z.record(z.string(), attributeValueSchema).optional(),
  language: z.string().length(2).default('en'),
});

// POST /api/submit/validate-witness
export const validateWitnessSchema = z.object({
  witnesses: z.array(witnessSchema).min(1).max(5),
});

// ============================================================
// VALIDATION HELPERS
// ============================================================

// Helper to validate and sanitize all text inputs
export function sanitizeText(text: string): string {
  // Remove script tags
  text = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove all HTML tags
  text = text.replace(/<[^>]+>/g, '');

  // Remove potential SQL injection patterns
  text = text.replace(/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|CREATE|ALTER)\b)/gi, '');

  // Normalize whitespace
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

// Helper to validate file upload
export function validateFileUpload(file: {
  name: string;
  size: number;
  type: string;
}): { valid: boolean; error?: string } {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'audio/mpeg',
    'audio/wav',
    'video/mp4',
    'video/quicktime'
  ];

  if (file.size > MAX_SIZE) {
    return { valid: false, error: `File size exceeds ${MAX_SIZE / 1024 / 1024}MB limit` };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: `File type ${file.type} not allowed` };
  }

  // Check for suspicious file extensions
  const ext = file.name.split('.').pop()?.toLowerCase();
  const suspiciousExts = ['exe', 'bat', 'cmd', 'sh', 'ps1', 'dll', 'scr'];

  if (ext && suspiciousExts.includes(ext)) {
    return { valid: false, error: 'Suspicious file extension detected' };
  }

  return { valid: true };
}

// Rate limiting configuration
export const RATE_LIMITS = {
  analyze: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // 30 requests per window
  },
  publish: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 submissions per hour
  },
  upload: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // 50 uploads per window
  },
};

// ============================================================
// TYPE EXPORTS FOR USE IN API ROUTES
// ============================================================

export type AnalyzeInput = z.infer<typeof analyzeSchema>;
export type AnalyzeCompleteInput = z.infer<typeof analyzeCompleteSchema>;
export type EnrichTextInput = z.infer<typeof enrichTextSchema>;
export type PublishInput = z.infer<typeof publishSchema>;
export type UploadInput = z.infer<typeof uploadSchema>;
export type GenerateQuestionsInput = z.infer<typeof generateQuestionsSchema>;
export type ValidateWitnessInput = z.infer<typeof validateWitnessSchema>;

// Validation middleware helper
export async function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Promise<{ success: true; data: T } | { success: false; errors: z.ZodError }> {
  try {
    const validated = await schema.parseAsync(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
}