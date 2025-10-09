import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string // 'photo' | 'video' | 'audio' | 'sketch'
    const experienceId = formData.get('experienceId') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!type) {
      return NextResponse.json({ error: 'Media type is required' }, { status: 400 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${timestamp}-${Math.random().toString(36).substring(7)}.${fileExt}`

    // Determine bucket based on type (using existing Supabase buckets)
    const bucketMap = {
      photo: 'images',
      video: 'images',  // Videos also go to images bucket
      audio: 'audio',
      sketch: 'images', // Sketches go to images bucket
    }

    const bucket = bucketMap[type as keyof typeof bucketMap] || 'images'

    // Convert File to ArrayBuffer then to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      console.error('Storage upload error:', error)
      return NextResponse.json(
        { error: 'Upload failed', message: error.message },
        { status: 500 }
      )
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(fileName)

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: data.path,
      type,
      fileName: file.name,
      size: file.size,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      {
        error: 'Upload failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export const runtime = 'edge'
export const dynamic = 'force-dynamic'
