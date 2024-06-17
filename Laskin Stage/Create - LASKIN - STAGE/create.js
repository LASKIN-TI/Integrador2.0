const axios = require('axios');

exports.customCreate = async (event) => {
  const { products } = event;

  for (const product of products) {
    try {
      await customRequest('https://laskin-cop.myshopify.com/admin/api/2023-07/products.json', 'POST', product);
      console.log('Producto creado exitosamente:', product);
    } catch (error) {
      console.error('Error al crear el producto:', error.message);
    }
  }

  return 'Productos creados exitosamente';
};

async function customRequest(path, type, product) {
  const url = path;
  const data = { product };

  try {
    const response = await axios({
      method: type,
      url: url,
      data: data,
      headers: {
        
      },
    });

    console.log('Respuesta de la API:', response.data);
    return Promise.resolve();
  } catch (error) {
    console.error('Error en la API:', error.message);
    return Promise.reject(error);
  }
}
