#!/usr/bin/env node
/**
 * Setup R2 Lifecycle Rule for Orphaned File Cleanup
 *
 * This script configures a lifecycle rule on the xpshare-media R2 bucket
 * to automatically delete uploaded files after 24 hours if they are not
 * referenced in the database (orphaned uploads).
 *
 * Similar to Twitter/X's 24h media expiration.
 */

import { S3Client, PutBucketLifecycleConfigurationCommand, GetBucketLifecycleConfigurationCommand } from '@aws-sdk/client-s3';

const ACCOUNT_ID = '081e85720f5d2c1a13232da65425156c';
const ACCESS_KEY_ID = 'e28786dae72ba0b2786407aefbb881db';
const SECRET_ACCESS_KEY = '899758d6705daacc288f25bb247895aca6787100bbb83a35643b0bcef8a1db1e';
const BUCKET_NAME = 'xpshare-media';

// Configure S3 client for R2
const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

async function setupLifecycleRule() {
  console.log('🔧 Setting up R2 Lifecycle Rule...\n');

  const lifecycleConfiguration = {
    Rules: [
      {
        ID: 'cleanup-pending-uploads',
        Status: 'Enabled',
        Filter: {
          Prefix: 'uploads-pending/', // ✅ Only temp files, not published!
        },
        Expiration: {
          Days: 1, // Delete after 24 hours
        },
      },
    ],
  };

  try {
    // Set the lifecycle configuration
    const command = new PutBucketLifecycleConfigurationCommand({
      Bucket: BUCKET_NAME,
      LifecycleConfiguration: lifecycleConfiguration,
    });

    await s3Client.send(command);

    console.log('✅ Lifecycle Rule Created Successfully!\n');
    console.log('📋 Configuration:');
    console.log(`   Bucket: ${BUCKET_NAME}`);
    console.log(`   Rule ID: cleanup-pending-uploads`);
    console.log(`   Prefix: uploads-pending/`);
    console.log(`   Action: Delete after 1 day (24 hours)`);
    console.log(`   Status: Enabled\n`);

    // Verify by reading back
    console.log('🔍 Verifying configuration...\n');
    const getCommand = new GetBucketLifecycleConfigurationCommand({
      Bucket: BUCKET_NAME,
    });

    const response = await s3Client.send(getCommand);
    console.log('✅ Current Lifecycle Rules:');
    console.log(JSON.stringify(response.Rules, null, 2));

    console.log('\n🎉 Setup Complete!');
    console.log('\n📝 What this does:');
    console.log('   - Files uploaded to uploads-pending/ are stored temporarily');
    console.log('   - On publish → Copied to experiences/ (permanent location)');
    console.log('   - Temp files deleted after 24h if NOT published');
    console.log('   - Published files in experiences/ are SAFE (no lifecycle rule!)');
    console.log('   - No server overhead, no cron jobs needed!\n');

  } catch (error) {
    console.error('❌ Error setting up lifecycle rule:', error.message);
    if (error.$metadata) {
      console.error('   HTTP Status:', error.$metadata.httpStatusCode);
    }
    process.exit(1);
  }
}

// Run
setupLifecycleRule();
