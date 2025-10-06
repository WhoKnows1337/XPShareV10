import { z } from 'zod'

/**
 * Environment variables schema validation
 */
const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // Neo4j
  NEO4J_URI: z.string().startsWith('neo4j'),
  NEO4J_USERNAME: z.string().min(1),
  NEO4J_PASSWORD: z.string().min(1),

  // OpenAI
  OPENAI_API_KEY: z.string().startsWith('sk-'),

  // Mapbox
  NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN: z.string().startsWith('pk.'),

  // App
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_DEFAULT_LOCALE: z.enum(['de', 'en', 'fr', 'es']).default('de'),

  // Optional
  NEXT_PUBLIC_VERCEL_ANALYTICS_ID: z.string().optional(),
})

/**
 * Validate environment variables at runtime
 * Call this in a Server Component or API route to ensure all required env vars are present
 */
export function validateEnv() {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missing = error.errors.map((e) => e.path.join('.')).join(', ')
      throw new Error(`Missing or invalid environment variables: ${missing}`)
    }
    throw error
  }
}

/**
 * Type-safe environment variables
 * Only use on server-side!
 */
export type Env = z.infer<typeof envSchema>

/**
 * Get environment variable safely
 */
export function getEnv<K extends keyof Env>(key: K): Env[K] {
  const value = process.env[key]
  if (!value && !key.includes('OPTIONAL')) {
    throw new Error(`Environment variable ${key} is not set`)
  }
  return value as Env[K]
}
