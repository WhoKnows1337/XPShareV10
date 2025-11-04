# R2 Cleanup Strategy - Orphaned Files Prevention

## Problem

When users upload files immediately (YouTube-style `autoProceed: true`), files are stored in Cloudflare R2 **before** the experience is published. This can lead to **orphaned files** in these scenarios:

1. **User uploads → navigates away** (draft not saved)
2. **User uploads → browser crashes**
3. **User uploads → changes mind and deletes locally**

Result: Files exist in R2 but have no DB reference → **Storage leak**

---

## Industry Best Practices

### **YouTube**
- Uploads immediately as Draft
- Drafts stored server-side indefinitely
- No auto-cleanup (users manage their drafts)

### **Facebook**
- Uploads immediately when scheduled
- **Drafts auto-delete after 3 days**
- Orphaned files cleaned with drafts

### **Twitter/X**
- Uploads before tweet creation
- **Media IDs expire after 24 hours**
- Automatic cleanup via expiration

---

## Our Solution (Recommended)

### **Option 1: R2 Lifecycle Rules** ⭐ **RECOMMENDED**

Configure Cloudflare R2 Lifecycle Policy to auto-delete old files:

#### **Implementation:**

1. **Login to Cloudflare Dashboard** → R2
2. **Select your bucket** (`xpshare-media` or similar)
3. **Create Lifecycle Rule:**
   ```yaml
   Rule Name: Cleanup Orphaned Uploads
   Prefix: experiences/users/
   Age: 24 hours
   Action: Delete
   ```

#### **How it works:**
- Files uploaded to `experiences/users/{userId}/{timestamp}-{random}.ext`
- If NOT referenced in `experience_media` table within 24h → Auto-delete
- Published experiences are safe (inserted to DB immediately)

#### **Pros:**
- ✅ No code changes needed
- ✅ Fully automatic
- ✅ Zero server overhead
- ✅ Industry standard (like Twitter)

#### **Cons:**
- ⚠️ Users must publish within 24h (reasonable for our use case)
- ⚠️ Requires Cloudflare dashboard access

---

### **Option 2: Two-Bucket Strategy** (More Complex)

Use separate buckets for temporary and permanent storage:

#### **Implementation:**

1. **Create two R2 buckets:**
   - `xpshare-temp-uploads` (24h TTL via Lifecycle Rule)
   - `xpshare-media` (permanent)

2. **Update `r2-client.ts`:**
   ```typescript
   // Upload to temp bucket
   export function generateFileKey(userId: string, fileName: string, prefix: string) {
     // Change prefix from 'experiences' to 'temp-uploads'
     return `temp-uploads/users/${userId}/${timestamp}-${random}.${ext}`;
   }
   ```

3. **On Publish → Copy to permanent:**
   ```typescript
   // In /api/submit/publish route
   for (const media of data.media) {
     if (media.url.includes('temp-uploads/')) {
       // Copy to permanent bucket
       const newUrl = await copyToPermBucket(media.url);
       media.url = newUrl;
     }
   }
   ```

#### **Pros:**
- ✅ Clear separation (temp vs perm)
- ✅ Guaranteed cleanup
- ✅ Can have different security rules

#### **Cons:**
- ❌ Requires code changes
- ❌ Double storage during upload
- ❌ Copy operation adds latency to publish

---

### **Option 3: Cron Job Cleanup** (Complex, Not Recommended)

Create a daily job to delete orphaned files:

#### **Implementation:**

1. **Create cleanup API route:**
   ```typescript
   // app/api/cron/cleanup-orphans/route.ts
   export async function GET() {
     // 1. List all R2 files older than 24h
     const oldFiles = await listR2Files({ olderThan: 24h });

     // 2. Check which files are in experience_media table
     const { data: dbFiles } = await supabase
       .from('experience_media')
       .select('url');

     // 3. Delete files NOT in DB
     const orphans = oldFiles.filter(f => !dbFiles.includes(f.url));
     await Promise.all(orphans.map(f => deleteFromR2(f.key)));

     return { deletedCount: orphans.length };
   }
   ```

2. **Configure Vercel Cron:**
   ```json
   // vercel.json
   {
     "crons": [{
       "path": "/api/cron/cleanup-orphans",
       "schedule": "0 2 * * *" // 2am daily
     }]
   }
   ```

#### **Pros:**
- ✅ Full control over cleanup logic
- ✅ Can log/monitor deletions
- ✅ Can handle complex edge cases

#### **Cons:**
- ❌ Requires Vercel Pro plan (Cron)
- ❌ Complex implementation
- ❌ Requires R2 list permissions
- ❌ Server overhead

---

## Comparison Matrix

| Solution | Complexity | Cost | Auto-Cleanup | User Window |
|----------|-----------|------|--------------|-------------|
| **R2 Lifecycle** | 🟢 Low | 🟢 Free | ✅ Yes (24h) | 24 hours |
| **Two-Bucket** | 🟡 Medium | 🟡 2x Storage | ✅ Yes (24h) | Unlimited |
| **Cron Job** | 🔴 High | 🔴 Pro Plan | ✅ Yes (custom) | Custom |
| **No Cleanup** | 🟢 None | 🔴 Growing | ❌ No | N/A |

---

## Recommendation

**Use Option 1: R2 Lifecycle Rules** ⭐

**Reasoning:**
1. **Simplest** implementation (zero code)
2. **Industry standard** (Twitter uses 24h expiration)
3. **Free** (no Vercel Pro needed)
4. **24h window** is reasonable for user experience flow

**When to use Option 2 (Two-Bucket):**
- If you need >24h upload-to-publish window
- If you want explicit temp/perm separation
- If you have specific compliance requirements

**When to use Option 3 (Cron):**
- If R2 Lifecycle Rules are not available
- If you need custom cleanup logic (e.g., email users before delete)
- If you already have Vercel Pro

---

## Configuration Steps (Option 1)

### 1. Create R2 Lifecycle Rule

```bash
# Via Cloudflare Dashboard:
1. Go to R2 → Select Bucket
2. Lifecycle Rules → Create Rule
3. Name: "Auto-delete old uploads"
4. Prefix: "experiences/users/"
5. Days: 1
6. Action: Delete
7. Save
```

### 2. Verify Configuration

After creating the rule, verify in console:

```typescript
// Test that published files are saved immediately
POST /api/submit/publish
→ Inserts to experience_media table
→ File is safe (has DB reference)

// Test that abandoned uploads are cleaned
Upload file → Don't publish → Wait 24h
→ File auto-deleted by R2
```

### 3. User Communication

Update UI to inform users:

```typescript
// In FileUploadSection.tsx
<div className="text-xs text-text-secondary">
  💡 Uploaded files are saved for 24 hours.
  Please publish your experience to keep them permanently.
</div>
```

---

## Edge Cases

### **Q: What if user saves Draft?**
**A:** Currently using `localStorage` only. Files will be cleaned after 24h even if draft exists in localStorage.

**Solution:** If Draft persistence is added to DB later, extend cleanup to check `draft_media` table too.

### **Q: What if user uploads large video (takes >1h)?**
**A:** Upload completes immediately to R2 (Cloudflare handles this). 24h timer starts AFTER upload completes.

**User flow:**
```
Upload 1GB video (takes 5min) → Stored in R2
24h timer starts NOW
User has 24h to publish
```

### **Q: What if user publishes after 23h59m?**
**A:** Safe! DB insert happens BEFORE 24h mark. File is referenced in `experience_media` → R2 won't delete.

---

## Monitoring (Optional)

To monitor cleanup activity:

```typescript
// R2 Analytics (Cloudflare Dashboard)
R2 → Analytics → Object Lifecycle Events
→ See deletion count over time
```

For alerts:

```typescript
// Workers Analytics Engine (requires Cloudflare Workers)
await env.ANALYTICS.writeDataPoint({
  blobs: ['orphan-cleanup'],
  doubles: [deletedCount],
  indexes: [new Date().toISOString()],
});
```

---

## Migration Plan

If switching from current system to R2 Lifecycle:

```typescript
// 1. Create Lifecycle Rule (non-destructive)
Cloudflare Dashboard → R2 → Create Rule

// 2. Monitor for 48h
Check that published experiences still work

// 3. Verify cleanup
Upload test file → Don't publish → Wait 24h → Check R2

// 4. Done!
No code changes needed
```

---

## FAQs

**Q: Does this affect already-published experiences?**
**A:** No! Published experiences have DB references in `experience_media` table. R2 Lifecycle Rules only delete files with no references.

**Q: What if I need longer than 24h?**
**A:** Increase Lifecycle Rule duration (e.g., 72h = 3 days). Adjust rule in Cloudflare Dashboard.

**Q: Can I test this locally?**
**A:** R2 Lifecycle Rules only work in production. For local testing, manually delete files or use Option 3 (Cron).

**Q: What's the cost?**
**A:** Free! R2 Lifecycle Rules are included in R2 pricing. No extra charges.

---

## Status

- ✅ **Implemented:** YouTube-style upload (autoProceed: true)
- ✅ **Implemented:** Store URLs in localStorage (not File objects)
- ⏳ **Pending:** R2 Lifecycle Rule configuration
- ⏳ **Pending:** User notification (24h window)
- ⏳ **Optional:** Monitoring/Analytics

---

## Related Files

- `lib/storage/r2-client.ts` - R2 upload/delete functions
- `lib/stores/submitFlowStore.ts` - Draft persistence (localStorage)
- `app/api/submit/publish/route.ts` - Publish flow with media insertion
- `components/submit-observatory/screen4/FileUploadSection.tsx` - Upload UI

---

## References

- [Cloudflare R2 Lifecycle Rules](https://developers.cloudflare.com/r2/buckets/object-lifecycles/)
- [Twitter Media Upload API](https://developer.x.com/en/docs/twitter-api/v1/media/upload-media/overview)
- [Facebook Draft Posts](https://developers.facebook.com/docs/pages/publishing/)
