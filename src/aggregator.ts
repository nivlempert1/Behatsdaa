import * as fs from 'fs';
import * as path from 'path';
import yargs from "yargs";
import {hideBin} from "yargs/helpers";

interface RetailerItem {
  cartId: string;
  'image-src': string;
  name: string;
}

interface Cart {
  items: RetailerItem[];
}

interface AggregatedRetailer {
  name: string;
  'image-src': string;
  carts: string[];
}

/**
 * Aggregates data from all cart JSON files in the specified directory
 * @param directoryPath Path to the directory containing cart JSON files
 * @returns An array of aggregated retailers with unique names and the carts they appear in
 */
function aggregateCartsData(directoryPath: string): AggregatedRetailer[] {
  const retailersMap: Map<string, AggregatedRetailer> = new Map();

  const files = fs.readdirSync(directoryPath).filter(file => file.endsWith('.json'));

  for (const file of files) {
    const filePath = path.join(directoryPath, file);
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    try {
      const cartData: Cart = JSON.parse(fileContent);

      for (const item of cartData.items) {
        const retailerName = item.name;

        if (retailersMap.has(retailerName)) {
          const retailer = retailersMap.get(retailerName)!;

          if (!retailer.carts.includes(item.cartId)) {
            retailer.carts.push(item.cartId);
          }
        }
        else {
          retailersMap.set(retailerName, {
            name: retailerName,
            'image-src': item['image-src'],
            carts: [item.cartId]
          });
        }
      }
    } catch (error) {
      console.error(`Error processing file ${file}:`, error);
    }
  }

  return Array.from(retailersMap.values());
}

/**
 * Saves the aggregated retailers data to a JSON file
 * @param data The aggregated retailers data
 * @param outputPath Path where to save the output file
 */
function saveAggregatedData(data: AggregatedRetailer[], outputPath: string): void {
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`Aggregated data saved to ${outputPath}`);
}

/**
 * Main function to run the aggregation process
 * @param inputDir Directory containing the cart JSON files
 * @param outputPath Path where to save the aggregated data
 */
function main(inputDir: string, outputPath: string): void {
  console.log(`Starting aggregation of cart data from ${inputDir}`);

  if (!fs.existsSync(inputDir)) {
    console.error(`Input directory ${inputDir} does not exist`);
    process.exit(1);
  }

  const aggregatedData = aggregateCartsData(inputDir);

  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  saveAggregatedData(aggregatedData, outputPath);
  console.log(`Aggregation complete. Found ${aggregatedData.length} unique retailers.`);
}

yargs(hideBin(process.argv))
  .command('$0', 'Aggregate retailers from cart data', (yargs) => {
    return yargs
      .option('input', {
        alias: 'i',
        describe: 'Directory containing cart JSON files',
        type: 'string',
        default: 'data/normalized',
        demandOption: false,
      })
      .option('output', {
        alias: 'o',
        describe: 'Path to save the aggregated retailers data',
        type: 'string',
        default: 'data/aggregations/aggregated_retailers.json',
        demandOption: false,
      });
  }, (argv) => {
    main(argv.input, argv.output);
  })
  .help()
  .alias('help', 'h')
  .version(false)
  .parse();
