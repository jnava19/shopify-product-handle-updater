const { request } = require('graphql-request');
const axios = require('axios');

const shopifyStoreUrl = 'https://your-shopify-store.myshopify.com/admin/api/2024-01/graphql.json';
const accessToken = 'your-access-token';

const headers = {
  'X-Shopify-Access-Token': accessToken,
  'Content-Type': 'application/json',
};

const fetchProductsQuery = `
  query fetchProducts($cursor: String) {
    products(first: 5, after: $cursor) {
      pageInfo {
        hasNextPage
      }
      edges {
        cursor
        node {
          id
          title
          handle
        }
      }
    }
  }
`;

const updateProductMutation = `
  mutation productUpdate($input: ProductInput!) {
    productUpdate(input: $input) {
      product {
        id
        handle
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const createRedirectMutation = `
  mutation urlRedirectCreate($urlRedirect: UrlRedirectInput!) {
    urlRedirectCreate(urlRedirect: $urlRedirect) {
      urlRedirect {
        path
        target
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const dryRun = false; // Set this to false to actually update the products and create redirects

let hasNextPage = true;
let cursor = null;

async function fetchAndUpdateProducts() {
  while (hasNextPage) {
    const variables = {
      cursor,
    };

    const response = await axios.post(shopifyStoreUrl, { query: fetchProductsQuery, variables }, { headers });
    const products = response.data.data.products.edges;
    hasNextPage = response.data.data.products.pageInfo.hasNextPage;

    for (const product of products) {
      cursor = product.cursor;
      const id = product.node.id;
      const oldHandle = product.node.handle;
      const newHandle = product.node.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      if (dryRun) {
        console.log(`Would update product ${id} from ${oldHandle} to ${newHandle}`);
      } else {
        const updateVariables = {
          input: {
            id,
            handle: newHandle,
          },
        };
        if(oldHandle === newHandle) {
        return;
        }
        const updateResponse = await request(shopifyStoreUrl, updateProductMutation, updateVariables, headers);
        if (updateResponse.productUpdate.userErrors.length > 0) {
          console.log(`Failed to update product ${id}:`, updateResponse.productUpdate.userErrors);
          const error = updateResponse.productUpdate.userErrors[0];
          if (error.field.includes('handle') && error.message.includes('already exists')) {
            console.log(`Handle ${newHandle} already exists, skipping product ${id}`);
            continue;
          }
        } else {
          console.log(`Successfully updated product ${id} to handle ${newHandle}`);
        }

        const redirectVariables = {
          urlRedirect: {
            path: `/products/${oldHandle}`,
            target: `/products/${newHandle}`,
          },
        };

        const redirectResponse = await request(shopifyStoreUrl, createRedirectMutation, redirectVariables, headers);
        if (redirectResponse.urlRedirectCreate.userErrors.length > 0) {
          console.log(`Failed to create redirect for product ${id}:`, redirectResponse.urlRedirectCreate.userErrors);
        } else {
          console.log(`Successfully created redirect from ${oldHandle} to ${newHandle}`);
        }
      }
    }
  }
}

fetchAndUpdateProducts().catch(err => console.error(`Error: ${err}`));
