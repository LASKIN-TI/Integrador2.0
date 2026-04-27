const axios = require('axios');

const SHOPIFY_STORE = process.env.SHOPIFY_STORE || 'laskin-co.myshopify.com';
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || '2026-04';

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
  };
}

exports.customCreate = async (event) => {
  const { products } = event;
  let failedProducts = 0;

  console.log('[CreateLambda][create] starting create batch', {
    productsCount: products ? products.length : 0,
  });

  for (const product of products) {
    try {
      console.log('[CreateLambda][create] creating product', summarizeProduct(product));
      await customRequest(shopifyUrl('products.json'), 'POST', product);
      console.log('[CreateLambda][create] product created successfully', summarizeProduct(product));
    } catch (error) {
      failedProducts += 1;
      console.error('[CreateLambda][create] product create failed', {
        product: summarizeProduct(product),
        message: error.message,
        status: error.response ? error.response.status : undefined,
        responseData: error.response ? error.response.data : undefined,
      });
    }
  }

  console.log('[CreateLambda][create] finished create batch', {
    productsCount: products ? products.length : 0,
  });

  if (failedProducts > 0) {
    throw new Error(`Failed to create ${failedProducts} products`);
  }

  return 'Productos creados exitosamente';
};

async function customRequest(path, type, product) {
  const url = path;
  const data = { product };

  try {
    console.log('[CreateLambda][create] sending Shopify request', {
      method: type,
      url,
      product: summarizeProduct(product),
    });

    const response = await axios({
      method: type,
      url: url,
      data: data,
      headers: shopifyHeaders(),
    });

    console.log('[CreateLambda][create] Shopify response', {
      status: response.status,
      productId: response.data && response.data.product ? response.data.product.id : undefined,
      variantId: response.data && response.data.product && response.data.product.variants && response.data.product.variants[0] ? response.data.product.variants[0].id : undefined,
      sku: response.data && response.data.product && response.data.product.variants && response.data.product.variants[0] ? response.data.product.variants[0].sku : undefined,
    });
    return Promise.resolve();
  } catch (error) {
    console.error('[CreateLambda][create] Shopify request failed', {
      method: type,
      url,
      product: summarizeProduct(product),
      message: error.message,
      status: error.response ? error.response.status : undefined,
      responseData: error.response ? error.response.data : undefined,
    });
    return Promise.reject(error);
  }
}
