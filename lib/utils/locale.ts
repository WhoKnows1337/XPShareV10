/**
 * Extract locale from pathname, handling both /submit3 and /en/submit3 patterns
 */
export function getLocaleFromPathname(pathname: string): string {
  const parts = pathname.split('/').filter(Boolean)
  const validLocales = ['en', 'de', 'fr', 'es']

  // Check if first part is a valid locale
  if (parts.length > 0 && validLocales.includes(parts[0])) {
    return parts[0]
  }

  // Default to 'en' if no locale found
  return 'en'
}
