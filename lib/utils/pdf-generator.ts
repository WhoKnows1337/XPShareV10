// PDF Generation Utility
//
// PRODUCTION SETUP OPTIONS:
//
// Option 1: Puppeteer (Browser-based PDF, best for complex layouts)
// npm install puppeteer
//
// Option 2: @react-pdf/renderer (React-based, lighter weight)
// npm install @react-pdf/renderer
//
// Option 3: pdfkit (Low-level, full control)
// npm install pdfkit

interface ExperienceData {
  id: string
  title: string
  category: string
  story_text: string
  date_occurred?: string
  location_text?: string
  tags?: string[]
  user_profiles?: {
    username: string
    display_name?: string
  }
}

/**
 * Generate styled HTML for PDF conversion
 */
export function generateExperiencePDFHTML(experience: ExperienceData): string {
  return `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>${experience.title} - XPShare Export</title>
  <style>
    @page {
      margin: 2cm;
      size: A4;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      color: #1a1a1a;
      line-height: 1.6;
    }
    .header {
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 3px solid #8b5cf6;
    }
    h1 {
      color: #8b5cf6;
      font-size: 28px;
      margin-bottom: 15px;
      font-weight: 700;
    }
    .meta {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      color: #666;
      font-size: 14px;
      margin-bottom: 30px;
      padding: 15px;
      background: #f9fafb;
      border-radius: 8px;
    }
    .meta-item {
      display: flex;
      flex-direction: column;
    }
    .meta-label {
      font-weight: 600;
      color: #374151;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .meta-value {
      color: #1f2937;
    }
    .content {
      margin: 30px 0;
      white-space: pre-wrap;
      font-size: 15px;
      line-height: 1.8;
    }
    .tags {
      margin: 30px 0;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .tag {
      display: inline-block;
      background: #ede9fe;
      color: #7c3aed;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 500;
    }
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      color: #9ca3af;
      font-size: 12px;
    }
    .footer a {
      color: #8b5cf6;
      text-decoration: none;
    }
    .category-badge {
      display: inline-block;
      background: #8b5cf6;
      color: white;
      padding: 4px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${experience.title}</h1>
    <span class="category-badge">${experience.category}</span>
  </div>

  <div class="meta">
    <div class="meta-item">
      <span class="meta-label">Autor</span>
      <span class="meta-value">${experience.user_profiles?.display_name || experience.user_profiles?.username || 'Anonymous'}</span>
    </div>
    ${experience.date_occurred ? `
    <div class="meta-item">
      <span class="meta-label">Datum</span>
      <span class="meta-value">${new Date(experience.date_occurred).toLocaleDateString('de-DE', {
        dateStyle: 'long'
      })}</span>
    </div>
    ` : ''}
    ${experience.location_text ? `
    <div class="meta-item">
      <span class="meta-label">Ort</span>
      <span class="meta-value">${experience.location_text}</span>
    </div>
    ` : ''}
    <div class="meta-item">
      <span class="meta-label">Experience ID</span>
      <span class="meta-value">${experience.id}</span>
    </div>
  </div>

  <div class="content">
${experience.story_text || 'Keine Beschreibung verfügbar.'}
  </div>

  ${experience.tags && experience.tags.length > 0 ? `
  <div class="tags">
    ${experience.tags.map((tag: string) => `<span class="tag">#${tag}</span>`).join('')}
  </div>
  ` : ''}

  <div class="footer">
    <p>
      Exportiert von XPShare am ${new Date().toLocaleString('de-DE', {
        dateStyle: 'long',
        timeStyle: 'short'
      })}<br>
      Original: <a href="https://xpshare.com/experiences/${experience.id}">https://xpshare.com/experiences/${experience.id}</a>
    </p>
    <p style="margin-top: 10px; font-style: italic;">
      XPShare - Platform for Sharing Extraordinary Experiences
    </p>
  </div>
</body>
</html>
  `
}

/**
 * Puppeteer-based PDF generation (requires puppeteer to be installed)
 *
 * Usage in API route:
 * ```
 * import puppeteer from 'puppeteer'
 * import { generateExperiencePDFWithPuppeteer } from '@/lib/utils/pdf-generator'
 *
 * const pdf = await generateExperiencePDFWithPuppeteer(experience)
 * return new NextResponse(pdf, {
 *   headers: {
 *     'Content-Type': 'application/pdf',
 *     'Content-Disposition': `attachment; filename="experience-${id}.pdf"`
 *   }
 * })
 * ```
 */
export async function generateExperiencePDFWithPuppeteer(
  experience: ExperienceData
): Promise<Buffer> {
  // This function requires puppeteer to be installed
  // Uncomment when puppeteer is added to dependencies

  /*
  const puppeteer = await import('puppeteer')
  const browser = await puppeteer.default.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  const page = await browser.newPage()
  const html = generateExperiencePDFHTML(experience)

  await page.setContent(html, { waitUntil: 'networkidle0' })

  const pdf = await page.pdf({
    format: 'A4',
    margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
    printBackground: true,
    preferCSSPageSize: true
  })

  await browser.close()

  return Buffer.from(pdf)
  */

  throw new Error('Puppeteer not installed. Install with: npm install puppeteer')
}

// Export types
export type { ExperienceData }
