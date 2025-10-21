/**
 * Supabase Type Helpers
 *
 * Helper types and utilities to work around Supabase's union type issues
 * when using .single() queries.
 */

import type { Database } from './database.types'

// Extract table row types
export type Tables = Database['public']['Tables']
export type TableName = keyof Tables
export type TableRow<T extends TableName> = Tables[T]['Row']
export type TableInsert<T extends TableName> = Tables[T]['Insert']
export type TableUpdate<T extends TableName> = Tables[T]['Update']

// Supabase query result types
export type SupabaseQueryResult<T> = {
  data: T | null
  error: any
}

export type SupabaseSingleResult<T extends TableName> = SupabaseQueryResult<TableRow<T>>

/**
 * Type assertion helper for .single() queries
 * Usage: const result = asSingle<'discovery_chats'>(await supabase.from(...).single())
 */
export function asSingle<T extends TableName>(
  result: any
): SupabaseSingleResult<T> {
  return result as SupabaseSingleResult<T>
}

/**
 * Type assertion helper for array queries
 */
export function asArray<T extends TableName>(
  result: any
): SupabaseQueryResult<TableRow<T>[]> {
  return result as SupabaseQueryResult<TableRow<T>[]>
}
