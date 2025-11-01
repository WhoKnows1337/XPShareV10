# 📦 Supabase Storage Buckets Setup

## Required Storage Buckets

For the secure file upload feature to work properly, you need to create the following storage buckets in your Supabase project:

### 1. Create Storage Buckets

Go to your Supabase Dashboard → Storage and create these buckets:

```sql
-- Run these in SQL Editor
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('experience-images', 'experience-images', true, 10485760,
   ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']),

  ('experience-audio', 'experience-audio', true, 10485760,
   ARRAY['audio/mpeg', 'audio/wav', 'audio/webm']),

  ('experience-videos', 'experience-videos', true, 10485760,
   ARRAY['video/mp4', 'video/webm', 'video/quicktime']),

  ('experience-media', 'experience-media', true, 10485760, NULL);
```

### 2. Set up RLS Policies

```sql
-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload their own files" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to update their own files
CREATE POLICY "Users can update their own files" ON storage.objects
FOR UPDATE TO authenticated
USING (auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own files" ON storage.objects
FOR DELETE TO authenticated
USING (auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public read access to experience media
CREATE POLICY "Public can view experience media" ON storage.objects
FOR SELECT TO public
USING (bucket_id IN ('experience-images', 'experience-audio', 'experience-videos', 'experience-media'));
```

### 3. Create experience_media Table

```sql
-- Create table for tracking media metadata
CREATE TABLE IF NOT EXISTS public.experience_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id UUID REFERENCES experiences(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('photo', 'audio', 'video', 'sketch', 'other')),
  url TEXT NOT NULL,
  filename TEXT,
  file_size INTEGER,
  mime_type TEXT,
  storage_path TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.experience_media ENABLE ROW LEVEL SECURITY;

-- Users can view media for public experiences
CREATE POLICY "View public experience media" ON public.experience_media
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM experiences
    WHERE experiences.id = experience_media.experience_id
    AND experiences.visibility = 'public'
  )
);

-- Users can view their own media
CREATE POLICY "Users can view own media" ON public.experience_media
FOR SELECT USING (auth.uid() = uploaded_by);

-- Users can insert their own media
CREATE POLICY "Users can insert own media" ON public.experience_media
FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

-- Users can update their own media
CREATE POLICY "Users can update own media" ON public.experience_media
FOR UPDATE USING (auth.uid() = uploaded_by);

-- Users can delete their own media
CREATE POLICY "Users can delete own media" ON public.experience_media
FOR DELETE USING (auth.uid() = uploaded_by);

-- Create indexes for performance
CREATE INDEX idx_experience_media_experience_id ON public.experience_media(experience_id);
CREATE INDEX idx_experience_media_uploaded_by ON public.experience_media(uploaded_by);
```

### 4. Configure CORS (if needed)

In your Supabase Dashboard → Settings → API:

Add these CORS headers:
```
Access-Control-Allow-Origin: https://your-domain.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: authorization, x-client-info, apikey, content-type
```

## File Upload Limits

Current configuration:
- **Max file size:** 10MB per file
- **Max files per upload:** 10 files
- **Rate limit:** 50 uploads per 15 minutes per user

## Storage Structure

Files are stored with this structure:
```
bucket-name/
├── user-id/
│   ├── timestamp-hash-filename.ext
│   └── timestamp-hash-filename2.ext
```

Example:
```
experience-images/
├── 123e4567-e89b-12d3-a456-426614174000/
│   ├── 1699123456789-a3f2d8e1-sunset.jpg
│   └── 1699123456790-b4c3f9a2-moon.png
```

## Testing Upload

Test the secure upload endpoint:

```javascript
const formData = new FormData();
formData.append('file0', fileBlob, 'test.jpg');
formData.append('experienceId', 'optional-experience-id');

const response = await fetch('/api/submit/upload', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: formData
});

const result = await response.json();
console.log(result);
```

## Security Features

1. **File Signature Validation:** Checks magic numbers match MIME type
2. **Extension Validation:** File extension must match MIME type
3. **Size Validation:** Max 10MB per file
4. **Filename Sanitization:** Removes path traversal attempts
5. **Unique Storage:** Hash-based unique filenames prevent overwrites
6. **User Isolation:** Files stored in user-specific folders
7. **Rate Limiting:** Prevents abuse

## Monitoring

Monitor these metrics:
- Upload success/failure rates
- Average file sizes
- Storage usage per user
- Rate limit hits
- Validation rejection reasons

## Troubleshooting

### Common Issues

1. **"Storage bucket not found"**
   - Ensure all buckets are created
   - Check bucket names match exactly

2. **"Upload failed"**
   - Check file size < 10MB
   - Verify MIME type is allowed
   - Check user authentication

3. **"Rate limit exceeded"**
   - User exceeded 50 uploads in 15 minutes
   - Wait for rate limit window to reset

4. **"File content does not match declared type"**
   - File's magic numbers don't match MIME type
   - User may be trying to bypass validation

## Maintenance

- Regularly clean orphaned files (files without experience records)
- Monitor storage usage and costs
- Review and update allowed MIME types as needed
- Check for security updates in file validation libraries

---

*Last Updated: November 2024*