/**
 * Generate a blurred placeholder for images
 * This creates a tiny base64-encoded SVG that serves as a blur placeholder
 */
export function getBlurDataURL(width: number = 40, height: number = 40): string {
  const svg = `
    <svg width="${width}" height="${height}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <defs>
        <linearGradient id="g">
          <stop stop-color="#7C7C7C" offset="0%" />
          <stop stop-color="#949494" offset="50%" />
          <stop stop-color="#7C7C7C" offset="100%" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="#7C7C7C" />
      <rect id="r" width="${width}" height="${height}" fill="url(#g)" />
      <animate xlink:href="#r" attributeName="x" from="-${width}" to="${width}" dur="1s" repeatCount="indefinite"  />
    </svg>`

  const base64 = Buffer.from(svg).toString('base64')
  return `data:image/svg+xml;base64,${base64}`
}

/**
 * Generate a shimmer effect placeholder
 */
export function getShimmerDataURL(): string {
  return getBlurDataURL(700, 475)
}

/**
 * Get a solid color blur placeholder
 * Useful for consistent loading states
 */
export function getSolidColorBlur(color: string = '#f3f4f6'): string {
  const svg = `
    <svg width="40" height="40" version="1.1" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" fill="${color}" />
    </svg>`

  const base64 = Buffer.from(svg).toString('base64')
  return `data:image/svg+xml;base64,${base64}`
}
