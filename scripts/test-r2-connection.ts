/**
 * Test Cloudflare R2 Connection
 * Run: npx tsx scripts/test-r2-connection.ts
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { uploadToR2, getPublicUrl } from '../lib/storage/r2-client';

async function testR2Connection() {
  console.log('🧪 Testing Cloudflare R2 Connection...\n');

  try {
    // 1. Test environment variables
    console.log('1️⃣ Checking environment variables...');
    const requiredEnvVars = [
      'R2_ACCOUNT_ID',
      'R2_ACCESS_KEY_ID',
      'R2_SECRET_ACCESS_KEY',
      'R2_BUCKET_NAME',
      'R2_PUBLIC_URL',
    ];

    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        throw new Error(`Missing environment variable: ${envVar}`);
      }
      console.log(`   ✅ ${envVar}: ${process.env[envVar]?.substring(0, 20)}...`);
    }

    // 2. Test file upload
    console.log('\n2️⃣ Testing file upload...');
    const testContent = 'Hello from XPShare V10! This is a test file uploaded to Cloudflare R2.';
    const testBuffer = Buffer.from(testContent, 'utf-8');

    const uploadResult = await uploadToR2({
      key: 'test/connection-test.txt',
      body: testBuffer,
      contentType: 'text/plain',
      metadata: {
        testRun: new Date().toISOString(),
        purpose: 'connection-test',
      },
    });

    console.log(`   ✅ Upload successful!`);
    console.log(`   📦 File key: ${uploadResult.key}`);
    console.log(`   🔗 Public URL: ${uploadResult.url}`);
    console.log(`   📊 Size: ${uploadResult.size} bytes`);

    // 3. Test public URL generation
    console.log('\n3️⃣ Testing public URL generation...');
    const publicUrl = getPublicUrl('test/another-file.jpg');
    console.log(`   ✅ Generated URL: ${publicUrl}`);

    // 4. Verify upload by fetching the file
    console.log('\n4️⃣ Verifying upload by fetching the file...');
    const response = await fetch(uploadResult.url);

    if (!response.ok) {
      throw new Error(`Failed to fetch uploaded file: ${response.status} ${response.statusText}`);
    }

    const fetchedContent = await response.text();

    if (fetchedContent === testContent) {
      console.log(`   ✅ File content verified! Upload is publicly accessible.`);
    } else {
      throw new Error('File content mismatch!');
    }

    console.log('\n🎉 All tests passed! Cloudflare R2 is ready to use!');
    console.log('\n📝 Next steps:');
    console.log('   1. Start your dev server: npm run dev');
    console.log('   2. Test file upload via the UI');
    console.log('   3. Deploy to Vercel: vercel --prod');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

testR2Connection();
