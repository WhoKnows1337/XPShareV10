import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { customAlphabet } from 'nanoid'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generate a unique ID for messages
 * Uses nanoid with custom alphabet (lowercase + numbers) for URL-safe IDs
 */
export const generateId = customAlphabet(
  '0123456789abcdefghijklmnopqrstuvwxyz',
  16
)
