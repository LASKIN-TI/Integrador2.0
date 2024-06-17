const axios = require('axios');
const db = require('../models/index.js');
const cron = require('node-cron');
require('dotenv').config();
const getEncryptedText = require('../services/Encrypt.js');
const plaintext = process.env.TOKEN;
const encryptedText = getEncryptedText(plaintext);


async function saveInventory() {
  const url = process.env.URL_PRODUCTS_HW;
  const plaintext = process.env.TOKEN;
  const encryptedText = getEncryptedText(plaintext);

  try {
    const response = await axios.get(url, {
      headers: {
        'ApiSignature': encryptedText
      }
    });
    const responseBody = response.data.response_body;

    if (Array.isArray(responseBody)) {
      if (responseBody.length !== 0) {
        // Recorre cada elemento del arreglo responseBody
        for (const product of responseBody) {
          if (Array.isArray(product.stock_by_store)) {
            // Mantén un conjunto de location_id_reference actuales para el SKU
            const currentLocations = new Set();

            // Recorre cada elemento del arreglo stock_by_store
            for (const stock of product.stock_by_store) {
              try {
                // Registra el location_id_reference procesado
                currentLocations.add(stock.id);

                // Busca un registro existente en la base de datos con el mismo sku y location_id_reference
                let existingRecord = await db.inventory.findOne({
                  where: {
                    sku: product.sku,
                    name: stock.description,
                    location_id_reference: stock.id
                  }
                });

                if (existingRecord) {
                  // Si el registro existe, actualiza el stock
                  await existingRecord.update({
                    name: stock.description,
                    available_reference: stock.stock
                  });

                  console.log(`Registro actualizado: SKU ${product.sku}, ID ${stock.id}, Stock ${stock.stock}`);
                } else {
                  // Si el registro no existe, crea uno nuevo
                  await db.inventory.create({
                    name: stock.description,
                    location_id_reference: stock.id,
                    available_reference: stock.stock,
                    sku: product.sku
                  });

                  console.log(`Nuevo registro creado: SKU ${product.sku}, ID ${stock.id}, Stock ${stock.stock}`);
                }
              } catch (error) {
                console.error(`Error al insertar o actualizar en la base de datos: ${error.message}`);
              }
            }

            // Actualiza los registros existentes que no están en currentLocations
            try {
              const existingRecords = await db.inventory.findAll({
                where: {
                  sku: product.sku
                }
              });

              for (const record of existingRecords) {
                if (!currentLocations.has(record.location_id_reference)) {
                  await record.update({ available_reference: 0 });
                  console.log(`Stock ajustado a 0: SKU ${record.sku}, ID ${record.location_id_reference}`);
                }
              }
            } catch (error) {
              console.error(`Error al actualizar stock a 0 en la base de datos: ${error.message}`);
            }
          } else {
            console.error(`El producto con SKU ${product.sku} no tiene stock_by_store definido o no es un arreglo.`);
            console.log('Producto:', product);
          }
        }

        console.log('Datos almacenados o actualizados exitosamente en la base de datos');
      } else {
        console.error('No hay registros en el sistema.');
      }
    } else {
      console.error('La respuesta de la API no contiene un array de productos.');
    }
  } catch (error) {
    console.error('¡Error en el servidor!', error);
  }
}

//saveInventory();

