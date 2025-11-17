#!/usr/bin/env node
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

const ACCOUNT_ID = '081e85720f5d2c1a13232da65425156c';
const ACCESS_KEY_ID = 'e28786dae72ba0b2786407aefbb881db';
const SECRET_ACCESS_KEY = '899758d6705daacc288f25bb247895aca6787100bbb83a35643b0bcef8a1db1e';
const BUCKET_NAME = 'xpshare-media';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

async function verifyCleanup() {
  const listCommand = new ListObjectsV2Command({
    Bucket: BUCKET_NAME,
    Prefix: 'uploads-pending/',
    MaxKeys: 10,
  });

  const response = await s3Client.send(listCommand);
  const objects = response.Contents || [];

  console.log(`\n🔍 Checking uploads-pending/ folder...`);
  console.log(`   Objects found: ${objects.length}`);

  if (objects.length === 0) {
    console.log('\n✅ SUCCESS! uploads-pending/ is now EMPTY!');
    console.log('   All old files have been cleaned up.');
    console.log('   New uploads will be automatically deleted after 24h.');
  } else {
    console.log('\n⚠️  Still has files:');
    objects.forEach(obj => console.log(`   - ${obj.Key}`));
  }
}

verifyCleanup();
