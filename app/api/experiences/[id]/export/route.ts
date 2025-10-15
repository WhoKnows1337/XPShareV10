import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateExperiencePDFHTML } from '@/lib/utils/pdf-generator'

// PDF Export for Experience (Spec Lines 213-220)
// For production PDF, install: npm install puppeteer
// Then use generateExperiencePDFWithPuppeteer from @/lib/utils/pdf-generator
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

    // Generate professional HTML for PDF
    const html = generateExperiencePDFHTML(experience as any)

    // PRODUCTION PDF GENERATION:
    // Uncomment when puppeteer is installed:
    /*
    import { generateExperiencePDFWithPuppeteer } from '@/lib/utils/pdf-generator'

    const pdf = await generateExperiencePDFWithPuppeteer(experience)

    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="experience-${id}.pdf"`,
      },
    })
    */

    // For now, return HTML. In production, convert to PDF with Puppeteer

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
