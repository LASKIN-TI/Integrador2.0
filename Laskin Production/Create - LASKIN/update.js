const axios = require('axios');


exports.customUpdate = async (event) => {
  const { products } = event;

  for (const product of products) {
    const shopify_id = product.id;
    await customRequest('https://laskin-co.myshopify.com/admin/api/2023-07/products/' + shopify_id + '.json', 'PUT', product);
  }
  return 'Products update successfully';
};

function customRequest(path, type, product) {
  let url = path;

  let data = {
    product: product
  };

  return axios({
    method: type,
    url: url,
    data: data,
    headers: {

    }
  })
  .then((response) => {
    return new Promise((resolve) => resolve())  
  })
    
  .catch((error) => {
    return new Promise((resolve) => resolve())
});
}