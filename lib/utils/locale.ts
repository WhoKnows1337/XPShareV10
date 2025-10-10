/**
 * Extract locale from Next.js pathname
 * @param pathname - The pathname from usePathname() hook
 * @returns The locale string (e.g., 'de', 'en', 'fr')
 */
export function getLocaleFromPathname(pathname: string): string {
  // Pathname format: /[locale]/rest/of/path
  // Extract the first segment after the leading slash
  const segments = pathname.split('/').filter(Boolean)
  return segments[0] || 'en' // Default to 'en' if no locale found
}
