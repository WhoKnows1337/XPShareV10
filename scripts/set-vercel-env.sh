#!/bin/bash
# Set Cloudflare R2 environment variables in Vercel
# Run: bash scripts/set-vercel-env.sh

echo "Setting Cloudflare R2 environment variables in Vercel..."

# R2 Account ID
vercel env add R2_ACCOUNT_ID production preview development <<EOF
081e85720f5d2c1a13232da65425156c
EOF

# R2 Access Key ID
vercel env add R2_ACCESS_KEY_ID production preview development <<EOF
e28786dae72ba0b2786407aefbb881db
EOF

# R2 Secret Access Key
vercel env add R2_SECRET_ACCESS_KEY production preview development <<EOF
899758d6705daacc288f25bb247895aca6787100bbb83a35643b0bcef8a1db1e
EOF

# R2 Bucket Name
vercel env add R2_BUCKET_NAME production preview development <<EOF
xpshare-media
EOF

# R2 Public URL
vercel env add R2_PUBLIC_URL production preview development <<EOF
https://pub-8df3db6388144d60abdb82837a210183.r2.dev
EOF

echo "✅ All R2 environment variables set in Vercel!"
echo "🚀 Redeploy your project for changes to take effect"
