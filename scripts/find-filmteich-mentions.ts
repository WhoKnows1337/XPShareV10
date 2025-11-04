import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';

const PROTOCOLS_DIR = '/home/tom/XPShareV10/downloaded-protocols';

interface FilmteichMention {
  file: string;
  year: string;
  mentions: number;
  snippet: string;
}

async function searchPDF(filePath: string): Promise<{ mentions: number; snippet: string } | null> {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    const text = data.text;

    // Search for Filmteich (case insensitive)
    const regex = /filmteich/gi;
    const matches = text.match(regex);

    if (matches && matches.length > 0) {
      // Extract snippet (first 200 chars around first mention)
      const firstIndex = text.toLowerCase().indexOf('filmteich');
      const start = Math.max(0, firstIndex - 100);
      const end = Math.min(text.length, firstIndex + 100);
      const snippet = text.substring(start, end).replace(/\s+/g, ' ').trim();

      return {
        mentions: matches.length,
        snippet: snippet
      };
    }

    return null;
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return null;
  }
}

async function findAllPDFs(dir: string): Promise<string[]> {
  const files: string[] = [];

  function traverse(currentPath: string) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        traverse(fullPath);
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.pdf')) {
        files.push(fullPath);
      }
    }
  }

  traverse(dir);
  return files;
}

async function main() {
  console.log('🔍 Searching all PDFs for Filmteichstraße mentions...\n');

  const allPDFs = await findAllPDFs(PROTOCOLS_DIR);
  console.log(`Found ${allPDFs.length} total PDFs\n`);

  const mentions: FilmteichMention[] = [];
  let processed = 0;

  for (const pdfPath of allPDFs) {
    processed++;

    if (processed % 50 === 0) {
      console.log(`Progress: ${processed}/${allPDFs.length} PDFs processed...`);
    }

    const result = await searchPDF(pdfPath);

    if (result) {
      const year = pdfPath.split('/').find(p => p.match(/^\d{4}$/)) || 'unknown';
      const fileName = path.basename(pdfPath);

      mentions.push({
        file: fileName,
        year,
        mentions: result.mentions,
        snippet: result.snippet
      });

      console.log(`✅ Found in: ${year}/${fileName} (${result.mentions} mentions)`);
    }
  }

  console.log(`\n\n📊 SUMMARY`);
  console.log(`Total PDFs scanned: ${allPDFs.length}`);
  console.log(`PDFs mentioning Filmteichstraße: ${mentions.length}\n`);

  // Group by year
  const byYear = mentions.reduce((acc, m) => {
    if (!acc[m.year]) acc[m.year] = [];
    acc[m.year].push(m);
    return acc;
  }, {} as Record<string, FilmteichMention[]>);

  console.log('\n📅 By Year:');
  Object.keys(byYear).sort().forEach(year => {
    console.log(`${year}: ${byYear[year].length} documents`);
  });

  // Save results to JSON
  const outputPath = '/home/tom/XPShareV10/downloaded-protocols/filmteich-mentions.json';
  fs.writeFileSync(outputPath, JSON.stringify(mentions, null, 2));
  console.log(`\n💾 Full results saved to: ${outputPath}`);

  // Save readable list
  const listPath = '/home/tom/XPShareV10/downloaded-protocols/filmteich-files-list.txt';
  const fileList = mentions
    .sort((a, b) => `${a.year}/${a.file}`.localeCompare(`${b.year}/${b.file}`))
    .map(m => `${m.year}/${m.file}`)
    .join('\n');
  fs.writeFileSync(listPath, fileList);
  console.log(`📝 File list saved to: ${listPath}\n`);
}

main().catch(console.error);
