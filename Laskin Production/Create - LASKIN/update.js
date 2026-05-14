const axios = require('axios');

const SHOPIFY_STORE = process.env.SHOPIFY_STORE || 'laskin-co.myshopify.com';
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || '2026-04';
const SHOPIFY_LOCATION_ID = process.env.SHOPIFY_LOCATION_ID || '90929758508';

function shopifyUrl(path) {
  return `https://${SHOPIFY_STORE}/admin/api/${SHOPIFY_API_VERSION}/${path}`;
}

function shopifyHeaders() {
  if (!process.env.SHOPIFY_ACCESS_TOKEN) {
    throw new Error('Missing SHOPIFY_ACCESS_TOKEN environment variable');
  }

  return {
    'Content-Type': 'application/json',
    'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN,
  };
}

function summarizeProduct(product) {
  return {
    id: product.id,
    title: product.title,
    status: product.status,
    sku: product.variants && product.variants[0] ? product.variants[0].sku : undefined,
    price: product.variants && product.variants[0] ? product.variants[0].price : undefined,
    inventory_quantity: product.variants && product.variants[0] ? product.variants[0].inventory_quantity : undefined,
    inventory_policy: product.variants && product.variants[0] ? product.variants[0].inventory_policy : undefined,
    inventory_item_id: product.variants && product.variants[0] ? product.variants[0].inventory_item_id : undefined,
  };
}

exports.customUpdate = async (event) => {
  const { products } = event;
  let failedProducts = 0;

  console.log('[CreateLambda][update] starting update batch', {
    productsCount: products ? products.length : 0,
  });

  for (const product of products) {
    try {
      const shopify_id = product.id;
      console.log('[CreateLambda][update] updating product', summarizeProduct(product));
      if (!shopify_id) {
        throw new Error('Product without Shopify id');
      }
      await customRequest(shopifyUrl(`products/${shopify_id}.json`), 'PUT', product);
      try {
        await syncInventoryIfNeeded(product);
      } catch (inventoryError) {
        console.warn('[CreateLambda][update] inventory sync skipped/failed', {
          product: summarizeProduct(product),
          message: inventoryError.message,
        });
      }
    } catch (error) {
      failedProducts += 1;
      console.error('[CreateLambda][update] product update failed', {
        product: summarizeProduct(product),
        message: error.message,
        status: error.response ? error.response.status : undefined,
        responseData: error.response ? error.response.data : undefined,
      });
    }
  }

  console.log('[CreateLambda][update] finished update batch', {
    productsCount: products ? products.length : 0,
  });

  if (failedProducts > 0) {
    throw new Error(`Failed to update ${failedProducts} products`);
  }

  return 'Products update successfully';
};

function customRequest(path, type, product) {
  let url = path;

  let data = {
    product: product
  };

  console.log('[CreateLambda][update] sending Shopify request', {
    method: type,
    url,
    product: summarizeProduct(product),
  });

  return axios({
    method: type,
    url: url,
    data: data,
    headers: shopifyHeaders(),
  })
  .then((response) => {
    console.log('[CreateLambda][update] Shopify response', {
      status: response.status,
      productId: response.data && response.data.product ? response.data.product.id : undefined,
      variantId: response.data && response.data.product && response.data.product.variants && response.data.product.variants[0] ? response.data.product.variants[0].id : undefined,
      sku: response.data && response.data.product && response.data.product.variants && response.data.product.variants[0] ? response.data.product.variants[0].sku : undefined,
    });
    return new Promise((resolve) => resolve())  
  })
    
  .catch((error) => {
    console.error('[CreateLambda][update] Shopify request failed', {
      method: type,
      url,
      product: summarizeProduct(product),
      message: error.message,
      status: error.response ? error.response.status : undefined,
      responseData: error.response ? error.response.data : undefined,
    });
    return Promise.reject(error)
  });
}

async function syncInventoryIfNeeded(product) {
  const variant = product && product.variants && product.variants[0] ? product.variants[0] : null;
  if (!variant) {
    return;
  }

  if (variant.inventory_quantity === undefined || variant.inventory_quantity === null) {
    return;
  }

  const locationId = product.location_id_reference || SHOPIFY_LOCATION_ID;
  if (!locationId) {
    console.warn('[CreateLambda][update] skipping inventory sync because location id is missing', {
      product: summarizeProduct(product),
    });
    return;
  }

  let inventoryItemId = variant.inventory_item_id;
  if (!inventoryItemId) {
    inventoryItemId = await fetchInventoryItemId(product.id);
  }

  if (!inventoryItemId) {
    console.warn('[CreateLambda][update] skipping inventory sync because inventory_item_id is missing', {
      product: summarizeProduct(product),
      locationId,
    });
    return;
  }

  await axios({
    method: 'POST',
    url: shopifyUrl('inventory_levels/set.json'),
    data: {
      inventory_item_id: inventoryItemId,
      location_id: Number(locationId),
      available: Number(variant.inventory_quantity),
    },
    headers: shopifyHeaders(),
  });

  console.log('[CreateLambda][update] inventory synced', {
    product: summarizeProduct(product),
    locationId,
    inventoryItemId,
    available: Number(variant.inventory_quantity),
  });
}

async function fetchInventoryItemId(productId) {
  const response = await axios({
    method: 'GET',
    url: shopifyUrl(`products/${productId}.json`),
    headers: shopifyHeaders(),
  });

  const product = response.data && response.data.product ? response.data.product : null;
  const variant = product && product.variants && product.variants[0] ? product.variants[0] : null;
  return variant ? variant.inventory_item_id : null;
}

