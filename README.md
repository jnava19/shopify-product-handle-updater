
# Shopify Product Handle Updater

This Node.js script updates the handles of all products in a Shopify store and creates URL redirects from the old handles to the new handles. The new handles are generated from the product titles.

## Prerequisites

- Node.js
- npm

## Installation

1. Clone this repository:

   ```bash
   git clone https://github.com/jnava19/shopify-product-handle-updater.git
   ```

2. Navigate to the project directory:

   ```bash
   cd shopify-product-handle-updater
   ```

3. Install the dependencies:

   ```bash
   npm install
   ```

## Configuration

1. Open `updateUrl.js` in a text editor.

2. Replace `your-shopify-store.myshopify.com` and `your-access-token` with your actual Shopify store URL and access token.

3. Set the `dryRun` variable to `true` for a dry run or `false` to actually update the products and create redirects.

## Usage

Run the script:

```bash
node updateUrl.js
```

## Notes

- The script fetches and updates products one by one to avoid hitting Shopify's rate limits. If you want to fetch and update products in parallel, you'll need to add rate limit handling to the script.
- The script doesn't check if the new handles are unique. If a product update fails because the new handle already exists, the script logs a message and skips the product.
- The script uses cursor-based pagination to fetch all products. If you have more than 250 products, you'll need to adjust the `first` argument in the `products` query.
