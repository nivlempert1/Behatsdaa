# CSV Data Normalizer

This tool normalizes CSV data exported from web scrapers, specifically for the Behatsdaa website structure.

## Features

- Removes unnecessary columns (`web-scraper-order`, `data`)
- Extracts the `walletId` from URLs and adds it as `cartId`
- Maintains `image-src` and `name` fields
- Outputs structured JSON with a consistent format

## Installation
