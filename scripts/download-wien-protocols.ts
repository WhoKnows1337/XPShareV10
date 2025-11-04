#!/usr/bin/env tsx

/**
 * Download all Bezirksvertretung Favoriten (District 10) protocols from 2020-2025
 *
 * Downloads:
 * - Main protocols (Protokolle)
 * - Inquiries (Anfragen)
 * - Motions (Anträge)
 */

import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

interface SessionInfo {
  year: number;
  date: string; // YYYY-MM-DD
  url: string;
  isDirect?: boolean; // If true, it's a direct PDF link
}

// All known sessions from 2020-2025
const SESSIONS: SessionInfo[] = [
  // 2025
  { year: 2025, date: '2025-09-24', url: 'https://www.wien.gv.at/pdf/bv10/sitzungen/20250924-protokoll.pdf', isDirect: true },
  { year: 2025, date: '2025-06-18', url: 'https://www.wien.gv.at/favoriten/sitzung-bezirksvertretung-2025-06' },
  { year: 2025, date: '2025-06-11', url: 'https://www.wien.gv.at/pdf/bv10/sitzungen/20250611-protokoll-konst-bvs.pdf', isDirect: true },
  { year: 2025, date: '2025-02-26', url: 'https://www.wien.gv.at/favoriten/sitzung-bezirksvertretung-2025-02' },

  // 2024
  { year: 2024, date: '2024-12-11', url: 'https://www.wien.gv.at/favoriten/sitzung-bezirksvertretung-2024-12' },
  { year: 2024, date: '2024-11-13', url: 'https://www.wien.gv.at/favoriten/sitzung-bezirksvertretung-2024-11' },
  { year: 2024, date: '2024-10-02', url: 'https://www.wien.gv.at/favoriten/sitzung-bezirksvertretung-2024-10' },
  { year: 2024, date: '2024-06-19', url: 'https://www.wien.gv.at/favoriten/sitzung-bezirksvertretung-2024-06' },
  { year: 2024, date: '2024-04-24', url: 'https://www.wien.gv.at/favoriten/sitzung-bezirksvertretung-2024-04' },
  { year: 2024, date: '2024-02-28', url: 'https://www.wien.gv.at/favoriten/sitzung-bezirksvertretung-2024-02' },

  // 2023
  { year: 2023, date: '2023-12-06', url: 'https://www.wien.gv.at/favoriten/sitzung-bezirksvertretung-2023-12' },
  { year: 2023, date: '2023-11-08', url: 'https://www.wien.gv.at/favoriten/sitzung-bezirksvertretung-2023-11' },
  { year: 2023, date: '2023-09-27', url: 'https://www.wien.gv.at/favoriten/sitzung-bezirksvertretung-2023-09' },
  { year: 2023, date: '2023-06-21', url: 'https://www.wien.gv.at/favoriten/sitzung-bezirksvertretung-2023-06' },
  { year: 2023, date: '2023-04-26', url: 'https://www.wien.gv.at/favoriten/sitzung-bezirksvertretung-2023-04' },
  { year: 2023, date: '2023-02-22', url: 'https://www.wien.gv.at/favoriten/sitzung-bezirksvertretung-2023-02' },

  // 2022
  { year: 2022, date: '2022-12-14', url: 'https://www.wien.gv.at/favoriten/sitzung-bezirksvertretung-2022-12' },
  { year: 2022, date: '2022-11-09', url: 'https://www.wien.gv.at/favoriten/sitzung-bezirksvertretung-2022-11' },
  { year: 2022, date: '2022-09-14', url: 'https://www.wien.gv.at/favoriten/sitzung-bezirksvertretung-2022-09' },
  { year: 2022, date: '2022-06-15', url: 'https://www.wien.gv.at/favoriten/sitzung-bezirksvertretung-2022-06' },
  { year: 2022, date: '2022-04-27', url: 'https://www.wien.gv.at/favoriten/sitzung-bezirksvertretung-2022-04' },
  { year: 2022, date: '2022-02-23', url: 'https://www.wien.gv.at/favoriten/sitzung-bezirksvertretung-2022-02' },

  // 2021
  { year: 2021, date: '2021-12-15', url: 'https://www.wien.gv.at/favoriten/sitzung-bezirksvertretung-2021-12' },
  { year: 2021, date: '2021-10-13', url: 'https://www.wien.gv.at/favoriten/sitzung-bezirksvertretung-2021-10' },
  { year: 2021, date: '2021-06-23', url: 'https://www.wien.gv.at/favoriten/sitzung-bezirksvertretung-2021-06' },
  { year: 2021, date: '2021-04-21', url: 'https://www.wien.gv.at/favoriten/sitzung-bezirksvertretung-2021-04' },
  { year: 2021, date: '2021-03-17', url: 'https://www.wien.gv.at/favoriten/sitzung-bezirksvertretung-2021-03' },
  { year: 2021, date: '2021-02-10', url: 'https://www.wien.gv.at/favoriten/sitzung-bezirksvertretung-2021-02' },

  // 2020
  { year: 2020, date: '2020-12-16', url: 'https://www.wien.gv.at/favoriten/sitzung-bezirksvertretung-2020-12' },
  { year: 2020, date: '2020-11-25', url: 'https://www.wien.gv.at/bezirke/favoriten/politik/sitzungen/pdf/protokoll20201125.pdf', isDirect: true },
  { year: 2020, date: '2020-09-30', url: 'https://www.wien.gv.at/favoriten/sitzung-bezirksvertretung-2020-09' },
  { year: 2020, date: '2020-06-24', url: 'https://www.wien.gv.at/favoriten/sitzung-bezirksvertretung-2020-06' },
  { year: 2020, date: '2020-03-04', url: 'https://www.wien.gv.at/favoriten/sitzung-bezirksvertretung-2020-03' },
];

interface DownloadStats {
  total: number;
  successful: number;
  failed: number;
  skipped: number;
}

const stats: DownloadStats = {
  total: 0,
  successful: 0,
  failed: 0,
  skipped: 0,
};

const failedDownloads: Array<{ url: string; error: string }> = [];

/**
 * Extract all PDF links from HTML content
 */
function extractPdfLinks(html: string): string[] {
  const links: string[] = [];

  // Match PDF links - various patterns found on wien.gv.at
  const patterns = [
    // Pattern 1: Direct PDF links in href attributes
    /href="(https:\/\/www\.wien\.gv\.at\/pdf\/bv10\/sitzungen\/[^"]+\.pdf)"/gi,
    // Pattern 2: Relative PDF links
    /href="(\/pdf\/bv10\/sitzungen\/[^"]+\.pdf)"/gi,
    // Pattern 3: Old-style links
    /href="(https:\/\/www\.wien\.gv\.at\/bezirke\/favoriten\/politik\/sitzungen\/pdf\/[^"]+\.pdf)"/gi,
    /href="(\/bezirke\/favoriten\/politik\/sitzungen\/pdf\/[^"]+\.pdf)"/gi,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      let url = match[1];
      // Convert relative URLs to absolute
      if (url.startsWith('/')) {
        url = `https://www.wien.gv.at${url}`;
      }
      if (!links.includes(url)) {
        links.push(url);
      }
    }
  }

  return links;
}

/**
 * Download a file from URL and save to disk
 */
async function downloadFile(url: string, destPath: string): Promise<boolean> {
  try {
    // Check if file already exists
    if (existsSync(destPath)) {
      console.log(`  ⏭️  Skipped (already exists): ${destPath.split('/').pop()}`);
      stats.skipped++;
      return true;
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await writeFile(destPath, buffer);
    console.log(`  ✅ Downloaded: ${destPath.split('/').pop()} (${(buffer.length / 1024).toFixed(2)} KB)`);
    stats.successful++;
    return true;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`  ❌ Failed: ${url} - ${errorMsg}`);
    failedDownloads.push({ url, error: errorMsg });
    stats.failed++;
    return false;
  }
}

/**
 * Process a single session
 */
async function processSession(session: SessionInfo): Promise<void> {
  console.log(`\n📄 Processing: ${session.date}`);

  const dateStr = session.date.replace(/-/g, ''); // YYYYMMDD
  const yearDir = join('/home/tom/XPShareV10/downloaded-protocols', String(session.year));

  // Ensure year directory exists
  await mkdir(yearDir, { recursive: true });

  if (session.isDirect) {
    // Direct PDF link - just download it
    const filename = session.url.split('/').pop()!;
    const destPath = join(yearDir, filename);
    stats.total++;
    await downloadFile(session.url, destPath);
  } else {
    // Fetch session page and extract all PDF links
    console.log(`  🔍 Fetching session page...`);

    try {
      const response = await fetch(session.url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      const pdfLinks = extractPdfLinks(html);

      console.log(`  📋 Found ${pdfLinks.length} PDF(s)`);

      if (pdfLinks.length === 0) {
        console.warn(`  ⚠️  No PDFs found on this page!`);
        return;
      }

      // Download each PDF
      for (const pdfUrl of pdfLinks) {
        const filename = pdfUrl.split('/').pop()!;
        const destPath = join(yearDir, filename);
        stats.total++;

        // Rate limiting - wait 100ms between downloads
        await new Promise(resolve => setTimeout(resolve, 100));
        await downloadFile(pdfUrl, destPath);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`  ❌ Failed to process session page: ${errorMsg}`);
      failedDownloads.push({ url: session.url, error: errorMsg });
    }
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting Wien Favoriten Protocol Download');
  console.log(`📅 Processing ${SESSIONS.length} sessions from 2020-2025\n`);

  const startTime = Date.now();

  // Process all sessions
  for (let i = 0; i < SESSIONS.length; i++) {
    const session = SESSIONS[i];
    console.log(`[${i + 1}/${SESSIONS.length}]`);
    await processSession(session);

    // Rate limiting between sessions
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  // Summary
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log('\n' + '='.repeat(60));
  console.log('📊 Download Summary');
  console.log('='.repeat(60));
  console.log(`Total PDFs:      ${stats.total}`);
  console.log(`✅ Successful:   ${stats.successful}`);
  console.log(`⏭️  Skipped:      ${stats.skipped} (already existed)`);
  console.log(`❌ Failed:       ${stats.failed}`);
  console.log(`⏱️  Duration:     ${duration}s`);

  if (failedDownloads.length > 0) {
    console.log('\n❌ Failed Downloads:');
    for (const fail of failedDownloads) {
      console.log(`  - ${fail.url}`);
      console.log(`    Error: ${fail.error}`);
    }
  }

  console.log('\n✨ Done!');
  console.log(`📁 Files saved to: /home/tom/XPShareV10/downloaded-protocols/`);
}

// Run
main().catch(console.error);
