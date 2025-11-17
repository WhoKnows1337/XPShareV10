#!/usr/bin/env node
/**
 * One-time cleanup script: Delete all files from uploads-pending/
 * Run this to clean up old uploads before the lifecycle rule was active
 */

import { S3Client, ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3';

const ACCOUNT_ID = '081e85720f5d2c1a13232da65425156c';
const ACCESS_KEY_ID = 'e28786dae72ba0b2786407aefbb881db';
const SECRET_ACCESS_KEY = '899758d6705daacc288f25bb247895aca6787100bbb83a35643b0bcef8a1db1e';
const BUCKET_NAME = 'xpshare-media';
const PREFIX = 'uploads-pending/';

// Configure S3 client for R2
const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

async function cleanupUploadsPending() {
  console.log('🧹 Cleaning up uploads-pending/ folder...\n');

  let totalDeleted = 0;
  let continuationToken = undefined;

  try {
    // List and delete in batches (R2 returns max 1000 objects per request)
    do {
      // 1. List objects with prefix
      const listCommand = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: PREFIX,
        MaxKeys: 1000,
        ContinuationToken: continuationToken,
      });

      const listResponse = await s3Client.send(listCommand);
      const objects = listResponse.Contents || [];

      if (objects.length === 0) {
        console.log('✅ No more objects to delete.');
        break;
      }

      console.log(`📋 Found ${objects.length} objects to delete...`);

      // 2. Delete objects in batch (max 1000 per request)
      const deleteCommand = new DeleteObjectsCommand({
        Bucket: BUCKET_NAME,
        Delete: {
          Objects: objects.map(obj => ({ Key: obj.Key })),
          Quiet: false, // Get confirmation for each deletion
        },
      });

      const deleteResponse = await s3Client.send(deleteCommand);
      const deleted = deleteResponse.Deleted || [];
      const errors = deleteResponse.Errors || [];

      totalDeleted += deleted.length;

      console.log(`  ✅ Deleted: ${deleted.length} objects`);
      if (errors.length > 0) {
        console.log(`  ❌ Errors: ${errors.length} objects`);
        errors.forEach(err => {
          console.error(`     - ${err.Key}: ${err.Message}`);
        });
      }

      // 3. Check if there are more objects (pagination)
      continuationToken = listResponse.NextContinuationToken;
      if (continuationToken) {
        console.log('📄 Fetching next page...\n');
      }

    } while (continuationToken);

    console.log('\n🎉 Cleanup complete!');
    console.log(`   Total deleted: ${totalDeleted} objects`);
    console.log(`   Folder: ${PREFIX}`);
    console.log('\n✅ New uploads will be automatically deleted after 24h by lifecycle rule.');

  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
    if (error.$metadata) {
      console.error('   HTTP Status:', error.$metadata.httpStatusCode);
    }
    process.exit(1);
  }
}

// Run
cleanupUploadsPending();
