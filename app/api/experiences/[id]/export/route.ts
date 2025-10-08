import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// PDF Export for Experience (Spec Lines 213-220)
// Note: This is a basic implementation. For production, use Puppeteer or @react-pdf/renderer
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params

    // Fetch experience data
    const { data: experience, error } = await supabase
      .from('experiences')
      .select(`
        *,
        user_profiles!experiences_user_id_fkey (
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('id', id)
      .single()

    if (error || !experience) {
      return NextResponse.json({ error: 'Experience not found' }, { status: 404 })
    }

    // Generate HTML for PDF
    const html = `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>${experience.title} - XPShare Export</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      color: #1a1a1a;
    }
    h1 {
      color: #8b5cf6;
      margin-bottom: 10px;
    }
    .meta {
      color: #666;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #e5e7eb;
    }
    .content {
      line-height: 1.8;
      margin-bottom: 30px;
    }
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      color: #666;
      font-size: 14px;
    }
    .tags {
      margin-top: 20px;
    }
    .tag {
      display: inline-block;
      background: #f3f4f6;
      padding: 4px 12px;
      border-radius: 4px;
      margin-right: 8px;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <h1>${experience.title}</h1>

  <div class="meta">
    <p>
      <strong>Autor:</strong> ${experience.user_profiles?.display_name || experience.user_profiles?.username}<br>
      <strong>Kategorie:</strong> ${experience.category}<br>
      <strong>Datum:</strong> ${experience.date_occurred ? new Date(experience.date_occurred).toLocaleDateString('de-DE') : 'Nicht angegeben'}<br>
      ${experience.location_text ? `<strong>Ort:</strong> ${experience.location_text}<br>` : ''}
    </p>
  </div>

  <div class="content">
    ${experience.story_text || ''}
  </div>

  ${experience.tags && experience.tags.length > 0 ? `
    <div class="tags">
      ${experience.tags.map((tag: string) => `<span class="tag">#${tag}</span>`).join('')}
    </div>
  ` : ''}

  <div class="footer">
    <p>
      Exportiert von XPShare am ${new Date().toLocaleDateString('de-DE')}<br>
      <a href="https://xpshare.com/experiences/${id}">https://xpshare.com/experiences/${id}</a>
    </p>
  </div>
</body>
</html>
    `

    // For now, return HTML. In production, convert to PDF with Puppeteer
    // Example with Puppeteer:
    // const browser = await puppeteer.launch()
    // const page = await browser.newPage()
    // await page.setContent(html)
    // const pdf = await page.pdf({ format: 'A4' })
    // await browser.close()
    // return new NextResponse(pdf, {
    //   headers: {
    //     'Content-Type': 'application/pdf',
    //     'Content-Disposition': `attachment; filename="experience-${id}.pdf"`
    //   }
    // })

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="experience-${id}.html"`,
      },
    })
  } catch (error) {
    console.error('PDF export error:', error)
    return NextResponse.json(
      { error: 'Failed to export experience' },
      { status: 500 }
    )
  }
}
