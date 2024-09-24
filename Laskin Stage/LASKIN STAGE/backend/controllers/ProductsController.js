const axios = require('axios');
const db = require('../models');
const cron = require('node-cron');
require('dotenv').config();
const getEncryptedText = require('../services/Encrypt');
const excel = require('exceljs');
const plaintext = process.env.TOKEN;
const encryptedText = getEncryptedText(plaintext);
const { recursiveEnqueueUpdate, recursiveEnqueue } = require('../AWS.js'); // Asegúrate de especificar la ruta correcta al archivo

exports.productsHW = async (req, res, next) => {
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

        const stockValue = await db.parameter.findOne({
          where: {
            id: 1, // Reemplaza con el nombre correcto
          },
        });

        if (stockValue) {
          const valueToAdjust = stockValue.value;

          const transformedProducts = responseBody.map((product) => {

            const taxable = product.tax_percentage !== 0 ? true : false;

            if (product.stock_quantity === valueToAdjust) {
              product.stock_quantity = 0;
            }

            const tags = product.line === "Productos" ? "PRODUCTO" : product.line;
            const uniqueTags = new Set();
            const onlytags = new Set();


            if (product.product_type && typeof product.product_type === 'string') {
              uniqueTags.add(product.product_type.charAt(0).toUpperCase() + product.product_type.slice(1).toLowerCase());
            }

            if (product.product_use && typeof product.product_use === 'string') {
              uniqueTags.add(product.product_use.charAt(0).toUpperCase() + product.product_use.slice(1).toLowerCase());
            }

            if (product.product_skin && typeof product.product_skin === 'string' && product.product_skin !== "No Aplica") {
              uniqueTags.add(product.product_skin.charAt(0).toUpperCase() + product.product_skin.slice(1).toLowerCase());
            }

            //001.TIPO PRODUCTO
            if (product.product_type && typeof product.product_type === 'string') {
              product.product_type = "001." + product.product_type.charAt(0).toUpperCase() + product.product_type.slice(1).toLowerCase();
              uniqueTags.add(product.product_type);
            }

            //002.USO PRODUCTO
            if (product.product_use && typeof product.product_use === 'string') {
              product.product_use = "002." + product.product_use.charAt(0).toUpperCase() + product.product_use.slice(1).toLowerCase();
              uniqueTags.add(product.product_use);
            }

            //003.PRODUCTO PIEL
            if (product.product_skin && typeof product.product_skin === 'string' && product.product_skin !== "No Aplica") {
              product.product_skin = "003." + product.product_skin.charAt(0).toUpperCase() + product.product_skin.slice(1).toLowerCase();
              uniqueTags.add(product.product_skin);
            }

            /*     if (product.product_brand !== product.product_laboratory) {
                  uniqueTags.add(product.product_brand);
                } */

            onlytags.forEach(tag => uniqueTags.add(tag));

            const additionalTags = Array.from(uniqueTags).sort();

            let price = parseFloat(product.discount_price).toFixed(2);
            let compareAtPrice = parseFloat(product.regular_price).toFixed(2);

            if (product.regular_price > product.discount_price) {
              price = parseFloat(product.discount_price).toFixed(2);
              compareAtPrice = parseFloat(product.regular_price).toFixed(2);
            } else if (product.regular_price === product.discount_price) {
              price = parseFloat(product.regular_price).toFixed(2);
              compareAtPrice = '';
            }

            const sortedTags = [...additionalTags].filter(Boolean).sort();

            const taxPercentage = parseFloat(product.tax_percentage) / 100; // Convertir a decimal y dividir por 100
            const price2 = parseFloat(product.discount_price); // Precio del producto
            const priceWithTax = Math.ceil(price2 - (price * taxPercentage));
            const weight = priceWithTax; // Asignar el resultado al peso


            return {
              title: product.name,
              body_html: sortedTags.join(', '),
              product_type: "PRODUCTO",
              vendor: product.product_brand && product.product_brand.trim() !== "" ? product.product_brand.toUpperCase() : "LASKIN",
              status: "draft",
              template_suffix: "",
              published: false,
              tags: sortedTags.join(', '),
              variants: [
                {
                  option1: "Default Title",
                  price: parseFloat(price),
                  compare_at_price: parseFloat(compareAtPrice),
                  sku: product.sku,
                  inventory_quantity: product.stock_quantity,
                  requires_shipping: "true",
                  inventory_management: "shopify",
                  barcode: product.barcode,
                  taxable: taxable,
                  weight: weight
                }
              ],
            };
          }).slice(0, 10000);

          const transformedData = {
            products: transformedProducts
          };

          res.status(200).json(transformedData);
        } else {
          res.status(404).send({
            error: 'Valor no encontrado en la tabla parameter',
          });
        }
      } else {
        res.status(404).send({
          error: 'No hay registros en el sistema.',
        });
      }
    } else {
      res.status(400).send({
        error: 'La respuesta de la API no contiene un array de productos.',
      });
    }
  } catch (error) {
    res.status(500).send({
      error: '¡Error en el servidor!',
    });
    next(error);
  }
};


exports.proceduresHW = async (req, res, next) => {
  const url = process.env.URL_PROCEDURES_HW;
  const plaintext = process.env.TOKEN;
  const encryptedText = getEncryptedText(plaintext);

  try {
    const response = await axios.get(url, {
      headers: {
        'ApiSignature': encryptedText,
        'Content-Type': 'application/json', // Ejemplo
        'Accept': 'application/json',
      }
    });

    const responseBody = response.data.response_body;

    if (Array.isArray(responseBody)) {
      if (responseBody.length !== 0) {
        const transformedProcedures = responseBody
          .map((procedure) => {

            const taxable = procedure.tax_percentage !== 0 ? true : false;

            const tags =
              procedure.line === "Procedimientos"
                ? "PROCEDIMIENTO"
                : procedure.line;

                const uniqueTags = new Set();
                const onlytags = new Set();
    
                if (procedure.procedure_group && typeof procedure.procedure_group === 'string') {
                  uniqueTags.add(procedure.procedure_group.charAt(0).toUpperCase() + procedure.procedure_group.slice(1).toLowerCase());
                }
    
                if (procedure.procedure_class && typeof procedure.procedure_class === 'string') {
                  uniqueTags.add(procedure.procedure_class.charAt(0).toUpperCase() + procedure.procedure_class.slice(1).toLowerCase());
                }

                 //001.TIPO PRODUCTO
            if (procedure.procedure_group && typeof procedure.procedure_group === 'string') {
              procedure.procedure_group = "001." + procedure.procedure_group.charAt(0).toUpperCase() + procedure.procedure_group.slice(1).toLowerCase();
              uniqueTags.add(procedure.procedure_group);
            }

            //001.TIPO PRODUCTO
            if (procedure.procedure_class && typeof procedure.procedure_class === 'string') {
              procedure.procedure_class = "002." + procedure.procedure_class.charAt(0).toUpperCase() + procedure.procedure_class.slice(1).toLowerCase();
              uniqueTags.add(procedure.procedure_class);
            }

            onlytags.forEach(tag => uniqueTags.add(tag));

            const additionalTags = Array.from(uniqueTags).sort();


            const procedureStoreDescriptions =
              procedure.procedure_store &&
                Array.isArray(procedure.procedure_store)
                ? procedure.procedure_store
                  .map((store) => store.description)
                  .join(", ")
                : "";


            let price = parseFloat(procedure.discount_price).toFixed(2);
            let compareAtPrice = parseFloat(procedure.regular_price).toFixed(2);

            if (procedure.regular_price > procedure.discount_price) {
              price = parseFloat(procedure.discount_price).toFixed(2);
              compareAtPrice = parseFloat(procedure.regular_price).toFixed(2);
            } else if (procedure.regular_price === procedure.discount_price) {
              price = parseFloat(procedure.regular_price).toFixed(2);
              compareAtPrice = "";
            }

            // Ordenar los elementos en el arreglo 'tags' alfabéticamente
              const sortedTags = [...additionalTags, procedureStoreDescriptions]
              .filter(Boolean)
              .join(", ");

            const reSortedTags = sortedTags.split(', ').sort().join(', ');

            const taxPercentage = parseFloat(procedure.tax_percentage) / 100; // Convertir a decimal y dividir por 100
            const price2 = parseFloat(procedure.discount_price); // Precio del producto
            const priceWithTax = price2 - (price2 * taxPercentage); // Restar el impuesto del precio
            const weight = priceWithTax; // Asignar el resultado al peso

            return {
              title: procedure.name,
              body_html: reSortedTags,
              product_type: "PROCEDIMIENTO",
              vendor: "LASKIN",
              status: "draft",
              statushw: procedure.status,
              published: false,
              template_suffix: "service",
              variants: [
                {
                  option1: "Default Title",
                  price: parseFloat(price),
                  compare_at_price: parseFloat(compareAtPrice),
                  sku: procedure.sku,
                  inventory_quantity: procedure.stock_quantity,
                  inventory_management: null,
                  requires_shipping: false,
                  taxable: taxable,
                  barcode: weight.toString()
                },
              ],
              tags: reSortedTags,
            };
          })
          .slice(0, 10000);

        const transformedData = {
          procedures: transformedProcedures,
        };

        res.status(200).json(transformedData);
      } else {
        res.status(404).send({
          error: "No hay registros en el sistema.",
        });
      }
    } else {
      res.status(400).send({
        error: "La respuesta de la API no contiene un array de procedimientos.",
      });
    }
  } catch (error) {
    res.status(500).send({
      error: "¡Error en el servidor!",
    });
    next(error);
  }
};

exports.products = async (req, res, next) => {
  const product = db.product;
  try {
    const products = await product.findAll({
      where: {
        product_type: 'PRODUCTO'
      }
    });

    if (!products || products.length === 0) {
      res.send({
        error: 'No hay registros en el sistema.',
      });
    } else {
      const transformedProducts = products.map((product) => {
        // Dividir la cadena de tags en un arreglo, ordenar el arreglo y luego unirlos nuevamente
        const tagsArray = product.tags.split(', ').sort();
        const sortedTags = tagsArray.join(', ');

        return {
          id: product.product_id,
          product_type: product.product_type,
          vendor: product.vendor,
          title: product.title,
          status: product.status,
          published: true,
          tags: sortedTags,
          published_at: product.published_at,
          variants: [
            {
              option1: "Default Title",
              price: product.price,
              compare_at_price: product.compare_at_price,
              sku: product.sku,
              inventory_quantity: product.inventory_quantity,
              inventory_policy: product.inventory_policy,
              inventory_management: product.inventory_management,
              barcode: product.barcode,
              taxable: product.taxable,
              weight: product.weight
            },
          ],
        };
      });

      const response = { products: transformedProducts };
      res.status(200).json(response);
    }
  } catch (error) {
    console.error('Error al consultar los productos:', error);
  }
};



exports.procedures = async (req, res, next) => {
  const product = db.product;
  try {
    const products = await product.findAll({
      where: {
        product_type: 'PROCEDIMIENTO'
      }
    });

    if (!products || products.length === 0) {
      res.send({
        error: 'No hay registros en el sistema.',
      });
    } else {
      const transformedProducts = products.map((product) => {
        // Dividir la cadena de tags en un arreglo, ordenar el arreglo y luego unirlos nuevamente
        const tagsArray = product.tags.split(', ').sort();
        const sortedTags = tagsArray.join(', ');

        return {
          id: product.product_id,
          product_type: product.product_type,
          vendor: product.vendor,
          title: product.title,
          status: product.status,
          published: true,
          tags: sortedTags,
          published_at: product.published_at,
          variants: [
            {
              option1: "Default Title",
              price: product.price,
              compare_at_price: product.compare_at_price,
              sku: product.sku,
              inventory_quantity: product.inventory_quantity,
              inventory_policy: product.inventory_policy,
              inventory_management: product.inventory_management,
              taxable: product.taxable,
              barcode: product.barcode
            },
          ],
        };
      });

      const response = { procedures: transformedProducts };
      res.status(200).json(response);
    }
  } catch (error) {
    console.error('Error al consultar los productos:', error);
  }
};


exports.proceduresList = async (req, res, next) => {
  const page = req.query.page;
  const pageSize = 100;

  const sku = req.query.sku;


  const whereCondition = {
    product_type: 'PROCEDIMIENTO'
  };

  if (sku) {
    whereCondition.sku = sku;
  }


  try {
    const result = await db.product.findAndCountAll({
      where: whereCondition,
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });

    const totalOrders = result.count;
    const totalPages = Math.ceil(totalOrders / pageSize);

    const transformedProducts = result.rows.map((product) => {
      // Dividir la cadena de tags en un arreglo, ordenar el arreglo y luego unirlos nuevamente
      const tagsArray = product.tags.split(', ').sort();
      const sortedTags = tagsArray.join(', ');

      return {
        id: product.product_id,
        product_type: product.product_type,
        vendor: product.vendor,
        title: product.title,
        status: product.status,
        published: true,
        tags: sortedTags,
        published_at: product.published_at,
        variants: [
          {
            option1: "Default Title",
            price: product.price,
            compare_at_price: product.compare_at_price,
            sku: product.sku,
            inventory_quantity: product.inventory_quantity,
            inventory_policy: product.inventory_policy,
            inventory_management: product.inventory_management
          },
        ],
      };
    });

    res.status(200).json({
      procedures: transformedProducts,
      totalPages: totalPages,
    });

  } catch (error) {
    console.error('Error al consultar los productos:', error);
  }
};


exports.create = async (req, res, next) => {
  try {
    const product = req.body;

    if (typeof product !== 'object' || Object.keys(product).length === 0) {
      return res.status(400).send({
        error: 'Objeto de producto inválido o vacío.',
      });
    }

    const createdProduct = await db.product.create({
      product_id: product.id,
      title: product.title,
      status: product.status,
      product_type: product.product_type,
      body_html: product.body_html,
      vendor: product.vendor,
      tags: product.tags,
      published_at: product.published_at,
      inventory_policy: product.variants[0].inventory_policy,
      inventory_management: product.variants[0].inventory_management,
      price: product.variants[0].price,
      compare_at_price: product.variants[0].compare_at_price,
      inventory_quantity: product.variants[0].inventory_quantity,
      requires_shipping: product.variants[0].requires_shipping,
      sku: product.variants[0].sku,
    });

    const newRecord = await db.record.create({
      message: "Creado",
      product_type: req.body.product_type,
      product_id: req.body.id,
      sku: req.body.variants[0].sku,
      title: req.body.title,
      product_type: req.body.product_type,
      body_html: req.body.body_html,
      vendor: req.body.vendor,
      status: req.body.status,
      price: req.body.variants[0].price,
      compare_at_price: req.body.variants[0].compare_at_price,
      tags: req.body.tags,
      inventory_quantity: req.body.variants[0].inventory_quantity,
      requires_shipping: req.body.variants[0].requires_shipping,
      inventory_management: req.body.variants[0].inventory_management,
      inventory_policy: req.body.variants[0].inventory_policy,
      type: 1,
      response_status: res.statusCode,
    });

    res.status(200).send({
      message: `Se creó el producto con éxito.`,
      createdProduct,
    });
  } catch (error) {
    const newRecord = await db.record.create({
      message: "Error en la creación del producto",
      type: 1,
      product_type: req.body.product_type,
      product_id: req.body.id,
      sku: req.body.variants[0].sku,
      title: req.body.title,
      product_type: req.body.product_type,
      body_html: req.body.body_html,
      vendor: req.body.vendor,
      status: req.body.status,
      price: req.body.variants[0].price,
      compare_at_price: req.body.variants[0].compare_at_price,
      tags: req.body.tags,
      inventory_quantity: req.body.variants[0].inventory_quantity,
      requires_shipping: req.body.variants[0].requires_shipping,
      inventory_management: req.body.variants[0].inventory_management,
      inventory_policy: req.body.variants[0].inventory_policy,
      response_status: res.statusCode,
    });

    res.status(500).send({
      error: '¡Error en el servidor!',
    });
    next(error);
  }
};


exports.update = async (req, res, next) => {
  try {
    //console.log('Datos recibidos en req.body:', req.body);

    const registro = await db.product.update(
      {
        title: req.body.title,
        product_type: req.body.product_type,
        body_html: req.body.body_html,
        vendor: req.body.vendor,
        tags: req.body.tags,
        status: req.body.status,
        published_at: req.body.published_at,
        inventory_policy: req.body.variants[0].inventory_policy,
        inventory_management: req.body.variants[0].inventory_management,
        price: req.body.variants[0].price,
        compare_at_price: req.body.variants[0].compare_at_price,
        inventory_quantity: req.body.variants[0].inventory_quantity,
        requires_shipping: req.body.variants[0].requires_shipping,
        sku: req.body.variants[0].sku,
      },
      {
        where: {
          product_id: req.body.id
        },
      }
    );

    const newRecord = await db.record.create({
      message: "Actualizado",
      product_type: req.body.product_type,
      product_id: req.body.id,
      sku: req.body.variants[0].sku,
      title: req.body.title,
      product_type: req.body.product_type,
      body_html: req.body.body_html,
      vendor: req.body.vendor,
      status: req.body.status,
      price: req.body.variants[0].price,
      compare_at_price: req.body.variants[0].compare_at_price,
      tags: req.body.tags,
      inventory_quantity: req.body.variants[0].inventory_quantity,
      requires_shipping: req.body.variants[0].requires_shipping,
      inventory_management: req.body.variants[0].inventory_management,
      inventory_policy: req.body.variants[0].inventory_policy,
      type: 2,
      response_status: res.statusCode,
    });

    //console.log('Nuevo registro creado en la tabla "record":', newRecord);

    res.status(200).send({
      message: 'Producto modificado con éxito.'
    });
  } catch (error) {
    console.error('Error en la actualización:', error);

    const newRecord = await db.record.create({
      message: "Error en la actualización",
      product_type: req.body.product_type,
      product_id: req.body.id,
      sku: req.body.variants[0].sku,
      title: req.body.title,
      product_type: req.body.product_type,
      body_html: req.body.body_html,
      vendor: req.body.vendor,
      status: req.body.status,
      price: req.body.variants[0].price,
      compare_at_price: req.body.variants[0].compare_at_price,
      tags: req.body.tags,
      inventory_quantity: req.body.variants[0].inventory_quantity,
      requires_shipping: req.body.variants[0].requires_shipping,
      inventory_management: req.body.variants[0].inventory_management,
      inventory_policy: req.body.variants[0].inventory_policy,
      type: 2,
      response_status: res.statusCode,
    });

    res.status(500).send({
      error: '¡Error en el servidor!'
    });
    next(error);
  }
};

exports.records = async (req, res, next) => {
  try {
    const page = req.query.page;
    const pageSize = 100;
    const dateFrom = req.query.dateFrom;
    const dateTo = req.query.dateTo;
    const sku = req.query.sku;
    const product_type = req.query.product_type;
    const message = req.query.message;

    const whereCondition = {};

    if (dateFrom && dateTo) {
      whereCondition.createdAt = {
        [db.Sequelize.Op.between]: [dateFrom, dateTo],
      };
    }

    if (sku) {
      whereCondition.sku = sku;
    }

    if (product_type) {
      whereCondition.product_type = product_type;
    }

    if (message) {
      whereCondition.message = message;
    }

    const result = await db.record.findAndCountAll({
      where: whereCondition,
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order: [['createdAt', 'DESC']],
    });

    const totalRecords = result.count;
    const totalPages = Math.ceil(totalRecords / pageSize);

    const transformedRecords = result.rows.map((product) => {
      return {
        id: product.product_id,
        product_type: product.product_type,
        vendor: product.vendor,
        title: product.title,
        status: product.status,
        published_scope: "global",
        tags: product.tags,
        response_status: product.response_status,
        message: product.message,
        type: product.type,
        createdAt: product.createdAt,
        variants: [
          {
            option1: "Default Title",
            price: product.price,
            compare_at_price: product.compare_at_price,
            sku: product.sku,
            inventory_quantity: product.inventory_quantity,
            inventory_policy: product.inventory_policy,
            inventory_management: product.inventory_management
          },
        ],
      };
    });

    res.status(200).json({
      records: transformedRecords,
      totalPages: totalPages,
    });
  } catch (error) {
    console.error('Error al consultar los productos:', error);
    res.status(500).json({ error: 'Ocurrió un error' });
  }
};


exports.downloadExcel = async function (req, res) {
  try {
    const page = req.query.page || 1; // Definir una página predeterminada si no se proporciona
    const pageSize = 30000; // Limitar el número de registros descargados

    const dateFrom = req.query.dateFrom;
    const dateTo = req.query.dateTo;
    const sku = req.query.sku;
    const product_type = req.query.product_type;
    const message = req.query.message;

    const whereCondition = {};

    if (dateFrom && dateTo) {
      // Convertir las fechas a objetos Date
      const fromDate = new Date(dateFrom);
      const toDate = new Date(dateTo);

      // Calcular la diferencia en milisegundos
      const difference = Math.abs(toDate - fromDate);

      // Calcular el número de días
      const differenceInDays = difference / (1000 * 3600 * 24);

      // Verificar si la diferencia es mayor a 31 días
      if (differenceInDays > 31) {
        return res.status(400).json({ error: 'El rango de fechas no puede superar los 31 días' });
      }

      whereCondition.createdAt = {
        [db.Sequelize.Op.between]: [dateFrom, dateTo],
      };
    }

    if (sku) {
      whereCondition.sku = sku;
    }

    if (product_type) {
      whereCondition.product_type = product_type;
    }

    if (message) {
      whereCondition.message = message;
    }

    const records = await db.record.findAndCountAll({
      where: whereCondition,
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order: [['createdAt', 'DESC']],
    });

    const result = await Promise.all(records.rows.map(async (record) => {
      const recordData = {
        ID: record.id,
        SKU: record.sku,
        Tipo_producto: record.product_type,
        Acción: record.message,
        Creación_Fecha: record.date_crea,
        Actualización_Fecha: record.date_act,
        ID_producto: record.product_id,
        Título: record.title,
        Vendedor: record.vendor,
        Estado: record.status,
        Precio: record.price,
        Precio_Comparación: record.compare_at_price,
        Etiquetas: record.tags,
        Inventario: record.inventory_quantity
      };
      return recordData;
    }));

    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet('Registros');

    // Agregar encabezados de columna
    const headers = Object.keys(result[0]);
    worksheet.addRow(headers);

    // Agregar datos
    result.forEach((order) => {
      const row = headers.map((header) => order[header]);
      worksheet.addRow(row);
    });

    // Configurar respuesta para descargar el archivo Excel
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=registros.xlsx');

    // Escribir el archivo Excel en la respuesta
    await workbook.xlsx.write(res);

    // Finalizar la respuesta
    res.end();
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Ocurrió un error al descargar el archivo Excel' });
  }
}



exports.states = async function (req, res) {
  try {
    const state = await db.state.findAll({});

    const result = await Promise.all(state.map(async (state) => {
      const stateData = {
        value: state.value,
        name: state.name,
      };
      return stateData;
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Ocurrió un error' });
  }
}

exports.updateStock = async (req, res, next) => {
  try {
    // Buscar la primera fila en la tabla credencial
    const stockRow = await db.state.findOne();

    if (stockRow) {
      await db.state.update(
        { value: req.body.value },
        { where: {}, limit: 1 } // Actualizar solo la primera fila
      );

      res.json({ success: 'Valor del stock actualizado con éxito' });
    } else {
      console.error('No se encontró campo de stock');
      res.status(500).json({ error: 'No se encontró campo de stock' });
    }
  } catch (error) {
    console.error('Error al actualizar el stock:', error);
    res.status(500).json({ error: 'Error al actualizar el stock' });
  }
};


//AUTOMATIZACIÓN
//PRODUCTS
const ProductsShopify = process.env.URL_PRODUCTS_LOCAL;
const ProductsHW = process.env.URL_PRODUCTS_HW_LOCAL;

async function fetchProducts(apiUrl) {
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Error al obtener datos de ${apiUrl}`);
    }
    const data = await response.json();

    if (!Array.isArray(data.products)) {
      throw new Error(`Data retrieved from ${apiUrl} is not an array`);
    }

    return data.products;
  } catch (error) {
    console.error(error);
    return [];
  }
}


async function compareProducts() {
  const productsShopify = await fetchProducts(ProductsShopify);
  const productsHW = await fetchProducts(ProductsHW);

  const differingHWProducts = {
    products: []
  };

  function processTags(tagsString) {
    const tags = tagsString.split(',').map(tag => tag.trim());
    const prefixedTags = new Map();
    const unprefixedTags = new Set();

    tags.forEach(tag => {
      const match = tag.match(/^(\d{3}\.)\s*(.*)$/);
      if (match) {
        const [, prefix, unprefixedTag] = match;
        prefixedTags.set(prefix, unprefixedTag);
      } else {
        unprefixedTags.add(tag);
      }
    });

    return { prefixedTags, unprefixedTags };
  }

  function removeConflictingTags(unprefixedTagsShopify, prefixedTagsShopify, prefixedTagsHW) {
    const cleanedUnprefixedTags = new Set(unprefixedTagsShopify);
  
    // Construir un conjunto de tags de HW que ya existen en Shopify con un prefijo diferente
    const conflictingHWTags = new Set();
    prefixedTagsShopify.forEach((tag, prefix) => {
      const tagHW = prefixedTagsHW.get(prefix);
      if (tagHW && tagHW !== tag) {
        conflictingHWTags.add(tag); // Agregar el tag de HW con un prefijo diferente al conjunto
      }
    });
  
    // Eliminar los tags de Shopify que están en la lista de tags conflictivos de HW
    cleanedUnprefixedTags.forEach(tag => {
      if (conflictingHWTags.has(tag)) {
        cleanedUnprefixedTags.delete(tag);
      }
    });
  
    return cleanedUnprefixedTags;
  }
  
  
  function combineTags(prefixedTagsHW, combinedUnprefixedTags) {
    const combinedTags = new Set();

    prefixedTagsHW.forEach((tag, prefix) => {
      combinedTags.add(`${prefix}${tag}`);
    });

    combinedUnprefixedTags.forEach(tag => {
      combinedTags.add(tag);
    });

    return Array.from(combinedTags).join(', ');
  }

  function comparePrefixedTags(tagsHW, tagsShopify) {
    const sortedTagsHW = Array.from(tagsHW.values()).sort().join(', ');
    const sortedTagsShopify = Array.from(tagsShopify.values()).sort().join(', ');
    return sortedTagsHW === sortedTagsShopify;
  }

  for (const productShopify of productsShopify) {
    const matchingProductHW = productsHW.find(
      (product) => product.variants[0].sku === productShopify.variants[0].sku
    );

    if (!matchingProductHW) {
      continue;
    }

    const { prefixedTags: prefixedTagsHW, unprefixedTags: unprefixedTagsHW } = processTags(matchingProductHW.tags);
    const { prefixedTags: prefixedTagsShopify, unprefixedTags: unprefixedTagsShopify } = processTags(productShopify.tags);

    const cleanedUnprefixedTagsShopify = removeConflictingTags(unprefixedTagsShopify, prefixedTagsShopify, prefixedTagsHW);
    
    const combinedUnprefixedTags = new Set([...unprefixedTagsHW, ...cleanedUnprefixedTagsShopify]);

    matchingProductHW.tags = combineTags(prefixedTagsHW, combinedUnprefixedTags);

    const prefixedTagsEqual = comparePrefixedTags(prefixedTagsHW, prefixedTagsShopify);

    if (
      matchingProductHW.variants[0].price !== productShopify.variants[0].price ||
      matchingProductHW.variants[0].inventory_quantity !== productShopify.variants[0].inventory_quantity ||
      matchingProductHW.vendor !== productShopify.vendor ||
      matchingProductHW.variants[0].taxable !== productShopify.variants[0].taxable ||
      !prefixedTagsEqual
    ) {
      matchingProductHW.id = productShopify.id;
      matchingProductHW.variants[0].inventory_policy = productShopify.variants[0].inventory_policy;
      delete matchingProductHW.title;
      delete matchingProductHW.body_html;
      delete matchingProductHW.status;
      delete matchingProductHW.product_type;
      delete matchingProductHW.template_suffix;
      delete matchingProductHW.published;
      delete matchingProductHW.template_suffix;
      delete matchingProductHW.variants[0].option1;
      delete matchingProductHW.variants[0].inventory_management;

      differingHWProducts.products.push(matchingProductHW);
    }
  }

  return differingHWProducts;
}


async function findActiveProductsNotInHW(productsShopify, productsHW) {
  const activeProductsNotInHW = [];

  for (const productShopify of productsShopify) {
    // Verifica si el producto en Shopify está activo
    if (productShopify.status === 'active' || productShopify.status === 'draft') {
      const matchingProductHW = productsHW.find(
        (product) => product.variants[0].sku === productShopify.variants[0].sku
      );

      if (!matchingProductHW) {
        // Cambia el estado del producto a "archived"
        productShopify.status = 'archived';
        productShopify.published = false
        activeProductsNotInHW.push(productShopify);
      }
    }
  }

  return activeProductsNotInHW;
}


async function findArchivedProductsInHW(productsShopify, productsHW) {
  const archivedProductsInHW = [];

  for (const productShopify of productsShopify) {
    // Verifica si el producto en Shopify está archivado
    if (productShopify.status === 'archived') {
      const matchingProductHW = productsHW.find(
        (product) => product.variants[0].sku === productShopify.variants[0].sku
      );

      if (matchingProductHW) {
        productShopify.status = 'draft'
        productShopify.published = false
        archivedProductsInHW.push(productShopify);
      }
    }
  }

  return archivedProductsInHW;
}

async function findProductsInHWNotInShopify(productsShopify, productsHW) {
  const productsNotInShopify = [];

  for (const productHW of productsHW) {
    const productWithoutTags = { ...productHW };

    const matchingProductShopify = productsShopify.find(
      (product) => product.variants[0].sku === productHW.variants[0].sku
    );

    if (!matchingProductShopify) {
      productsNotInShopify.push(productWithoutTags);
    }
  }
  return productsNotInShopify;
}


async function findActiveProductsWithNullPublished(productsShopify) {
  const activeProductsWithNullPublished = productsShopify.filter((productShopify) => {
    return productShopify.status === 'active' && productShopify.published_at === '';
  });

  return activeProductsWithNullPublished;
}

async function findProductsInStateWithCriteria() {
  try {
    const state = await db.state.findOne({ where: { id: 0, value: 1 } });

    if (state) {
      const productsShopify = await fetchProducts(ProductsShopify);

      const filteredProducts = productsShopify.filter((product) => {
        return product.status === 'active' && product.variants[0].inventory_policy !== 'continue';
      });
      filteredProducts.forEach(async (product) => {
        product.variants[0].inventory_policy = 'continue';
      });

      return filteredProducts;
    } else {
      const productsShopify = await fetchProducts(ProductsShopify);
      const activeProductsToChangePolicy = productsShopify.filter((product) => {
        return product.status === 'active' && product.variants[0].inventory_policy === 'continue';
      });

      activeProductsToChangePolicy.forEach(async (product) => {
        product.variants[0].inventory_policy = 'deny';
      });

      return activeProductsToChangePolicy;
    }
  } catch (error) {
    console.error(error);
    return [];
  }
}

let modifiedProducts;
let activeProductsNotInHW;
let archivedProductsInHW;
let productsInHWNotInShopify;
let activeProductsWithNullPublished;
let productsInState;

let modifiedProducts2;
let activeProductsNotInHW2;
let archivedProductsInHW2;
let productsInHWNotInShopify2;
let activeProductsWithNullPublished2;
let productsInState2;

async function processDifferingHWProducts() {
  try {
    const productsShopify = await fetchProducts(ProductsShopify);
    const productsHW = await fetchProducts(ProductsHW);

    if (productsShopify.length === 0 || productsHW.length === 0) {
      console.log('No se pudo recuperar la información de ProductsShopify o ProductsHW. No se ejecutará processDifferingHWProducts.');
      return;
    }

    const differingHWProducts = await compareProducts();
    modifiedProducts = differingHWProducts.products.map((product) => ({
      variants: product.variants,
      id: product.id,
      tags: product.tags,
      vendor: product.vendor,
      taxable: product.variants[0].taxable,
      weight: product.variants[0].weight
    }));


    activeProductsNotInHW = await findActiveProductsNotInHW(productsShopify, productsHW);
    archivedProductsInHW = await findArchivedProductsInHW(productsShopify, productsHW);
    productsInHWNotInShopify = await findProductsInHWNotInShopify(productsShopify, productsHW);
    activeProductsWithNullPublished = await findActiveProductsWithNullPublished(productsShopify);
    productsInState = await findProductsInStateWithCriteria();

    modifiedProducts2 = differingHWProducts.products.map((product) => ({
      variants: product.variants,
      id: product.id,
      //tags: product.tags,
      vendor: product.vendor
    }));
    activeProductsNotInHW2 = await findActiveProductsNotInHW(productsShopify, productsHW);
    archivedProductsInHW2 = await findArchivedProductsInHW(productsShopify, productsHW);
    productsInHWNotInShopify2 = await findProductsInHWNotInShopify(productsShopify, productsHW);
    activeProductsWithNullPublished2 = await findActiveProductsWithNullPublished(productsShopify);
    productsInState2 = await findProductsInStateWithCriteria();

    console.log('*PRODUCTOS PARA MODIFICAR:', modifiedProducts.length);
    console.log('*PRODUCTOS PARA ARCHIVAR:', activeProductsNotInHW.length);
    console.log('*PRODUCTOS PARA ACTIVAR:', archivedProductsInHW.length);
    console.log('*PRODUCTOS PARA CREAR:', productsInHWNotInShopify.length);
    console.log('*PRODUCTOS PARA CANAL DE VENTA:', activeProductsWithNullPublished.length);
    console.log('*PRODUCTOS PARA SEGUIR VENDIENDO:', productsInState.length);


    //console.log('--------------------------');

    if (modifiedProducts.length > 0) {
      await recursiveEnqueueUpdate(modifiedProducts, 0); //Modificar
    }

    if (activeProductsNotInHW.length > 0) {
      await recursiveEnqueueUpdate(activeProductsNotInHW, 0); //Modificar
    }

    if (archivedProductsInHW.length > 0) {
      await recursiveEnqueueUpdate(archivedProductsInHW, 0); //Modificar
    }

    if (productsInHWNotInShopify.length > 0) {
      await recursiveEnqueue(productsInHWNotInShopify, 0); //Modificar
    }

    if (activeProductsWithNullPublished.length > 0) {
      await recursiveEnqueueUpdate(activeProductsWithNullPublished, 0); //Modificar
    }

    if (productsInState.length > 0) {
      await recursiveEnqueueUpdate(productsInState, 0); //Modificar
    }
  } catch (error) {
    console.error(error);
  }
}

//PROCEDURES
const ProceduresShopify = process.env.URL_PROCEDURES_LOCAL;
const ProceduresHW = process.env.URL_PROCEDURES_HW_LOCAL;

async function fetchProcedures(apiUrl) {
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Error al obtener datos de ${apiUrl}`);
    }
    const data = await response.json();

    if (!Array.isArray(data.procedures)) {
      throw new Error(`Data retrieved from ${apiUrl} is not an array`);
    }

    return data.procedures;
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function compareProcedures() {
  const proceduresShopify = await fetchProcedures(ProceduresShopify);
  const proceduresHW = await fetchProcedures(ProceduresHW);

  const differingHWProcedures = {
    procedures: []
  };

  function processTags(tagsString) {
    const tags = tagsString.split(',').map(tag => tag.trim());
    const prefixedTags = new Set();
    const unprefixedTags = new Set();
    const hyphenatedTags = new Set();

    tags.forEach(tag => {
      if (tag.match(/^\d{3}\./)) {
        prefixedTags.add(tag);
      } else if (tag.includes('-')) {
        hyphenatedTags.add(tag);
      } else {
        unprefixedTags.add(tag);
      }
    });

    return { prefixedTags, unprefixedTags, hyphenatedTags };
  }

  function removePrefixedMatches(unprefixedTags, prefixedTags) {
    const cleanedUnprefixedTags = new Set(unprefixedTags);
    prefixedTags.forEach(prefixedTag => {
      const unprefixedVersion = prefixedTag.replace(/^\d{3}\.\s*/, '');
      if (unprefixedTags.has(unprefixedVersion)) {
        cleanedUnprefixedTags.delete(unprefixedVersion);
      }
    });
    return cleanedUnprefixedTags;
  }

  function compareTags(tagsHW, tagsShopify) {
    const sortedTagsHW = Array.from(tagsHW).sort().join(', ');
    const sortedTagsShopify = Array.from(tagsShopify).sort().join(', ');
    return sortedTagsHW === sortedTagsShopify;
  }

  for (const procedureShopify of proceduresShopify) {
    const matchingProcedureHW = proceduresHW.find(
      (procedure) => procedure.variants[0].sku === procedureShopify.variants[0].sku
    );

    if (!matchingProcedureHW) {
      continue;
    }

    const { prefixedTags: prefixedTagsHW, unprefixedTags: unprefixedTagsHW, hyphenatedTags: hyphenatedTagsHW } = processTags(matchingProcedureHW.tags);
    const { prefixedTags: prefixedTagsShopify, unprefixedTags: unprefixedTagsShopify, hyphenatedTags: hyphenatedTagsShopify } = processTags(procedureShopify.tags);

    const cleanedUnprefixedTagsShopify = removePrefixedMatches(unprefixedTagsShopify, prefixedTagsShopify);
    const combinedUnprefixedTags = new Set([...unprefixedTagsHW, ...cleanedUnprefixedTagsShopify]);

    matchingProcedureHW.tags = [
      ...Array.from(prefixedTagsHW),
      ...Array.from(combinedUnprefixedTags),
      ...Array.from(hyphenatedTagsHW)
    ].join(', ');

    const prefixedTagsEqual = compareTags(prefixedTagsHW, prefixedTagsShopify);
    const hyphenatedTagsEqual = compareTags(hyphenatedTagsHW, hyphenatedTagsShopify);

    if (
      matchingProcedureHW.variants[0].price !== procedureShopify.variants[0].price ||
      matchingProcedureHW.variants[0].taxable !== procedureShopify.variants[0].taxable ||
      matchingProcedureHW.variants[0].barcode !== procedureShopify.variants[0].barcode ||
      !prefixedTagsEqual ||
      !hyphenatedTagsEqual
    ) {
      matchingProcedureHW.id = procedureShopify.id;

      delete matchingProcedureHW.title;
      delete matchingProcedureHW.body_html;
      delete matchingProcedureHW.vendor;
      delete matchingProcedureHW.status;
      delete matchingProcedureHW.product_type;
      delete matchingProcedureHW.template_suffix;
      delete matchingProcedureHW.published;
      delete matchingProcedureHW.template_suffix;
      delete matchingProcedureHW.variants[0].option1;
      //delete matchingProcedureHW.variants[0].inventory_management;

      differingHWProcedures.procedures.push(matchingProcedureHW);
    }
  }

  return differingHWProcedures;
}

async function findActiveProceduresNotInHW(proceduresShopify, proceduresHW) {
  const activeProceduresNotInHW = [];

  for (const procedureShopify of proceduresShopify) {
    // Verifica si el procedimiento en Shopify está activo
    if (procedureShopify.status === 'active' || procedureShopify.status === 'draft') {
      const matchingProcedureHW = proceduresHW.find(
        (procedure) => procedure.variants[0].sku === procedureShopify.variants[0].sku
      );

      if (!matchingProcedureHW) {
        // Cambia el estado del procedimiento a "archived"
        procedureShopify.status = 'archived';
        procedureShopify.published = false
        activeProceduresNotInHW.push(procedureShopify);
      }
    }
  }

  return activeProceduresNotInHW;
}

async function findArchivedProceduresInHW(proceduresShopify, proceduresHW) {
  const archivedProceduresInHW = [];

  for (const procedureShopify of proceduresShopify) {
    // Verifica si el procedimiento en Shopify está archivado
    if (procedureShopify.status === 'archived') {
      const matchingProcedureHW = proceduresHW.find(
        (procedure) => procedure.variants[0].sku === procedureShopify.variants[0].sku
      );

      if (matchingProcedureHW) {
        procedureShopify.status = 'draft'
        procedureShopify.published = 'false'
        archivedProceduresInHW.push(procedureShopify);
      }
    }
  }

  return archivedProceduresInHW;
}

async function findProceduresInHWNotInShopify(proceduresShopify, proceduresHW) {
  const proceduresNotInShopify = [];

  for (const procedureHW of proceduresHW) {
    const matchingProcedureShopify = proceduresShopify.find(
      (procedure) => procedure.variants[0].sku === procedureHW.variants[0].sku
    );

    if (!matchingProcedureShopify) {
      proceduresNotInShopify.push(procedureHW);
    }
  }

  return proceduresNotInShopify;
}

//ACTIVOS SIN CANAL DE VENTAS
async function findActiveProceduresWithNullPublished(proceduresShopify, proceduresHW) {
  const activeProceduresWithNullPublished = [];

  for (const procedureShopify of proceduresShopify) {
    // Verifica si el procedimiento en Shopify está activo
    if (procedureShopify.status === 'active' && procedureShopify.published_at === '') {
      // Busca el procedimiento correspondiente en proceduresHW
      const matchingProcedureHW = proceduresHW.find(
        (procedure) => procedure.variants[0].sku === procedureShopify.variants[0].sku
      );

      // Verifica si se encontró un procedimiento coincidente y si su estado es "publish"
      if (matchingProcedureHW && matchingProcedureHW.statushw === 'publish') {
        // Cambia el estado del procedimiento a "active"
        procedureShopify.status = 'active';
        procedureShopify.published = true;
        activeProceduresWithNullPublished.push(procedureShopify);
      }
    }
  }
  return activeProceduresWithNullPublished;
}


async function checkAndUpdateInventoryManagement(procedures) {
  const proceduresToUpdate = [];

  for (const procedure of procedures) {
    if (procedure.variants[0].inventory_management === 'shopify') {
      // Actualizar el campo inventory_management a null
      procedure.variants[0].inventory_management = null;
      proceduresToUpdate.push(procedure);
    }
  }

  return proceduresToUpdate;
}



let modifiedProcedures;
let activeProceduresNotInHW;
let archivedProceduresInHW;
let proceduresInHWNotInShopify;
let activeProceduresWithNullPublished;
let proceduresToUpdateInventory;

let modifiedProcedures2;
let activeProceduresNotInHW2;
let archivedProceduresInHW2;
let proceduresInHWNotInShopify2;
let activeProceduresWithNullPublished2;

async function processDifferingHWProcedures() {
  try {
    const proceduresShopify = await fetchProcedures(ProceduresShopify);
    const proceduresHW = await fetchProcedures(ProceduresHW);

    if (proceduresShopify.length === 0 || proceduresHW.length === 0) {
      console.log('No se pudo recuperar la información de proceduresShopify o proceduresHW. No se ejecutará processDifferingHWProducts.');
      return;
    }

    const differingHWProcedures = await compareProcedures();
    modifiedProcedures = differingHWProcedures.procedures.map((procedure) => ({
      variants: procedure.variants,
      id: procedure.id,
      taxable: procedure.variants[0].taxable,
      barcode: procedure.variants[0].barcode,
      tags: procedure.tags
    }));

    activeProceduresNotInHW = await findActiveProceduresNotInHW(proceduresShopify, proceduresHW);
    archivedProceduresInHW = await findArchivedProceduresInHW(proceduresShopify, proceduresHW);
    proceduresInHWNotInShopify = await findProceduresInHWNotInShopify(proceduresShopify, proceduresHW);
    activeProceduresWithNullPublished = await findActiveProceduresWithNullPublished(proceduresShopify, proceduresHW);
    proceduresToUpdateInventory = await checkAndUpdateInventoryManagement(proceduresShopify);

    modifiedProcedures2 = differingHWProcedures.procedures.map((procedure) => ({
      variants: procedure.variants,
      id: procedure.id,
      //tags: procedure.tags
    }));
    activeProceduresNotInHW2 = await findActiveProceduresNotInHW(proceduresShopify, proceduresHW);
    archivedProceduresInHW2 = await findArchivedProceduresInHW(proceduresShopify, proceduresHW);
    proceduresInHWNotInShopify2 = await findProceduresInHWNotInShopify(proceduresShopify, proceduresHW);
    activeProceduresWithNullPublished2 = await findActiveProceduresWithNullPublished(proceduresShopify, proceduresHW);

    console.log('-PROCEDIMIENTOS PARA MODIFICAR:', modifiedProcedures.length);

    /* for (const modifiedProcedure of modifiedProcedures) {
      console.log('Variants de procedimiento con ID', modifiedProcedure.id);
      console.log(modifiedProcedure.variants);
    } */

    console.log('-PROCEDIMIENTOS PARA ARCHIVAR:', activeProceduresNotInHW.length);

    /*     for (const activeProcedureNotInHW of activeProceduresNotInHW) {
          console.log('Variants de procedimiento con ID', activeProcedureNotInHW.id);
          console.log(activeProcedureNotInHW.variants);
        } */

    console.log('-PROCEDIMIENTOS PARA ACTIVAR:', archivedProceduresInHW.length);
    console.log('-PROCEDIMIENTOS PARA CREAR:', proceduresInHWNotInShopify.length);
    console.log('-PROCEDIMIENTOS PARA COLOCAR EN CANAL DE VENTA:', activeProceduresWithNullPublished.length);
    console.log('-PROCEDIMIENTOS PARA CAMBIAR EL RASTREO DE INVENTARIO:', proceduresToUpdateInventory.length);


    //console.log('--------------------------');

    if (modifiedProcedures.length > 0) {
      await recursiveEnqueueUpdate(modifiedProcedures, 0); //Modificar
    }

    if (activeProceduresNotInHW.length > 0) {
      await recursiveEnqueueUpdate(activeProceduresNotInHW, 0); //Modificar
    }

    if (archivedProceduresInHW.length > 0) {
      await recursiveEnqueueUpdate(archivedProceduresInHW, 0); //Modificar
    }

    if (proceduresInHWNotInShopify.length > 0) {
      await recursiveEnqueue(proceduresInHWNotInShopify, 0); //Modificar
    }

    if (activeProceduresWithNullPublished.length > 0) {
      await recursiveEnqueueUpdate(activeProceduresWithNullPublished, 0); //Modificar
    }

    if (proceduresToUpdateInventory.length > 0) {
      await recursiveEnqueueUpdate(proceduresToUpdateInventory, 0); //Modificar
    }
  } catch (error) {
    console.error(error);
  }
}

//processDifferingHWProcedures()
processDifferingHWProducts();

//'*/1 * * * *' minuto
//'0 * * * *' hora

cron.schedule('0 * * * *', async () => {
  try {
    // Obtener el valor del parámetro de la base de datos
    const state = await db.state.findOne({ where: { id: 1 } });

    if (state && state.value === 1) {
      const currentDate = new Date();
      const colombiaTime = new Date(currentDate.toLocaleString('en-US', { timeZone: 'America/Bogota' }));

      const year = colombiaTime.getFullYear();
      const month = String(colombiaTime.getMonth() + 1).padStart(2, '0'); // Sumar 1 al mes ya que los meses comienzan en 0
      const day = String(colombiaTime.getDate()).padStart(2, '0');
      const hours = String(colombiaTime.getHours()).padStart(2, '0');
      const minutes = String(colombiaTime.getMinutes()).padStart(2, '0');
      const seconds = String(colombiaTime.getSeconds()).padStart(2, '0');

      const formattedDate = `${year}.${month}.${day} ${hours}:${minutes}:${seconds}`;

      await processDifferingHWProcedures();

      let TotalProcedures = modifiedProcedures2.length + activeProceduresNotInHW2.length
        + archivedProceduresInHW2.length + proceduresInHWNotInShopify2.length +
        activeProceduresWithNullPublished2.length

      await db.date.create({
        date_hw: formattedDate,
        date_rabbit: formattedDate,
        state: 'PROCEDIMIENTO_AUTO',
        responsible: 'AUTOMATICO',
        qty: TotalProcedures
      });
    } else {
      console.log('El valor del parámetro es 0. La tarea cron no se ejecutará.');
    }

  } catch (error) {
    console.error('Error al ejecutar la tarea cron:', error);
  }
}, {
  timezone: 'America/Bogota',
  scheduled: true,
  currentSeconds: 0,
});


cron.schedule('0 * * * *', async () => {
  try {
    const state = await db.state.findOne({ where: { id: 1 } });

    if (state && state.value === 1) {
      const currentDate = new Date();

      const colombiaTime = new Date(currentDate.toLocaleString('en-US', { timeZone: 'America/Bogota' }));

      const year = colombiaTime.getFullYear();
      const month = String(colombiaTime.getMonth() + 1).padStart(2, '0'); // Sumar 1 al mes ya que los meses comienzan en 0
      const day = String(colombiaTime.getDate()).padStart(2, '0');
      const hours = String(colombiaTime.getHours()).padStart(2, '0');
      const minutes = String(colombiaTime.getMinutes()).padStart(2, '0');
      const seconds = String(colombiaTime.getSeconds()).padStart(2, '0');

      const formattedDate = `${year}.${month}.${day} ${hours}:${minutes}:${seconds}`;


      await processDifferingHWProducts();

      let TotalProducts = modifiedProducts2.length + activeProductsNotInHW2.length
        + archivedProductsInHW2.length
        + productsInHWNotInShopify2.length
        + activeProductsWithNullPublished2.length
        + productsInState2.length;

      await db.date.create({
        date_hw: formattedDate,
        date_rabbit: formattedDate,
        state: 'PRODUCTO_AUTO',
        responsible: 'AUTOMATICO',
        qty: TotalProducts
      });
    } else {
      console.log('El valor del parámetro es 0. La tarea cron no se ejecutará.');
    }

  } catch (error) {
    console.error('Error al guardar la hora en la base de datos:', error);
  }
}, {
  timezone: 'America/Bogota',
  scheduled: true,
  currentSeconds: 0,
});
