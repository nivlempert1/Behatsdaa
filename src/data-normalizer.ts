import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

interface ScrapedRow {
  'web-scraper-order': string;
  'web-scraper-start-url': string;
  'data': string;
  'image-src': string;
  'name': string;
}

interface NormalizedItem {
  cartId: string;
  'image-src': string;
  name: string;
}

/**
 * Extracts the walletId from a URL like https://www.behatsdaa.org.il/card/shops?walletId=2868
 */
function extractWalletId(url: string): string {
  const match = url.match(/walletId=(\d+)/);
  return match ? match[1] : '';
}

/**
 * Normalizes CSV data by:
 * - Removing web-scraper-order column
 * - Removing data column
 * - Extracting walletId from web-scraper-start-url as cartId
 * - Keeping image-src and name fields
 */
export function normalizeData(inputFile: string, outputFile: string): void {
  try {
    const csvData = fs.readFileSync(inputFile, 'utf8');
    
    const records: ScrapedRow[] = parse(csvData, {
      columns: true,
      skip_empty_lines: true
    });

    const firstUrl = records[0]['web-scraper-start-url'];
    const cartId = extractWalletId(firstUrl);
    
    const normalizedItems: NormalizedItem[] = records.map(row => ({
      cartId,
      'image-src': row['image-src'],
      name: row.name
    }));

    const normalizedData = {
      items: normalizedItems
    };

    const outputDir = path.dirname(outputFile);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(
      outputFile,
      JSON.stringify(normalizedData, null, 2),
      'utf8'
    );

    console.log(`Normalized data saved to ${outputFile}`);
  } catch (error) {
    console.error('Error normalizing data:', error);
    throw error;
  }
}

if (require.main === module) {
  const argv = yargs(hideBin(process.argv))
    .usage('Usage: $0 [options]')
    .option('input', {
      alias: 'i',
      describe: 'Input CSV file path',
      type: 'string',
      demandOption: true
    })
    .option('output', {
      alias: 'o',
      describe: 'Output JSON file path',
      type: 'string'
    })
    .help()
    .alias('help', 'h')
    .example('$0 -i data.csv', 'Convert data.csv to data.json')
    .example('$0 -i data.csv -o output.json', 'Convert data.csv to output.json')
    .parseSync();

  const inputFile = argv.input;
  const outputFile = argv.output || inputFile.replace(/\.csv$/, '.json');

  normalizeData(inputFile, outputFile);
}
