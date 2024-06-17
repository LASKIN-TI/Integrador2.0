const axios = require('axios');
const cron = require('node-cron');
const db = require('../models');
const excel = require('exceljs');
const path = require('path');
const getEncryptedText = require('../services/Encrypt');
const plaintext = process.env.TOKEN;
const encryptedText = getEncryptedText(plaintext);
const xml2js = require('xml2js');
const { Op } = require('sequelize');
require('dotenv').config();

exports.list = async function (req, res) {
  try {
    const orders = await db.order.findAll({
      order: [['order_date', 'DESC']],
      where: {
        //state: 0,
        order_status: 'wc-processing',
      },
      include: {
        model: db.order_items
      },
    });

    const result = await Promise.all(orders.map(async (order) => {
      const orderData = {
        order_ref: order.order_ref,
        id_shopify: order.id_shopify,
        order_id: order.order_id,
        order_date: order.order_date,
        order_modified: order.order_modified,
        order_status: order.order_status,
        payment_method: order.payment_method,
        transaction_id: order.transaction_id,
        customer_ip_address: order.customer_ip_address,
        customer_user: order.customer_user,
        billing_cedula: order.billing_cedula,
        billing_first_name: order.billing_first_name,
        billing_last_name: order.billing_last_name,
        billing_email: order.billing_email,
        billing_phone: order.billing_phone,
        billing_address_1: order.billing_address_1,
        billing_address_2: order.billing_address_2,
        billing_city: order.billing_city,
        billing_typedcity: order.billing_typedcity,
        billing_zona: order.billing_zona,
        billing_state: order.billing_state,
        billing_country: order.billing_country,
        shipping_first_name: order.shipping_first_name,
        shipping_last_name: order.shipping_last_name,
        shipping_address_1: order.shipping_address_1,
        shipping_address_2: order.shipping_address_2,
        shipping_city: order.shipping_city,
        shipping_typedcity: order.shipping_typedcity,
        shipping_zona: order.shipping_zona,
        shipping_state: order.shipping_state,
        shipping_country: order.shipping_country,
        order_total: order.order_total,
        cupon_code: order.cupon_code,
        code: order.code,
        message: order.message,
        state: order.state,
        shipping_notes: order.shipping_notes,
        location: order.location,
        branch_description: order.branch_description,
        branch_id: order.branch_id,
        latitud: order.lat,
        longitud: order.lng,
        mensaje: order.mensaje,
        order_items: [],
      };

      if (order.order_items && order.order_items.length > 0) {
        await Promise.all(order.order_items.map(async (item) => {
          orderData.order_items.push({
            product_id: item.product_id,
            order_item_name: item.order_item_name,
            sku: item.sku,
            pa_sucursal: item.pa_sucursal,
            unitario_coniva: item.unitario_coniva,
            valor_dcto: item.valor_dcto,
            valor_bruto: item.valor_bruto,
            qty: item.qty,
            line_total: item.line_total,
            cupon_hw: item.cupon_hw,
            cupon_ue: item.cupon_ue,
          });
        }));
      }
      orderData.json = JSON.stringify(orderData, null, 2);

      return orderData;
    }));

    res.status(200).json({ orders: result });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Ocurrió un error' });
  }
}


exports.orders = async function (req, res) {
  try {
    const page = req.query.page;
    const pageSize = 100;

    const dateFrom = req.query.dateFrom;
    const dateTo = req.query.dateTo;
    const status = req.query.status;
    const id_shopify = req.query.id_shopify;
    const order_id = req.query.order_id;


    const whereCondition = {
      order_status: 'wc-processing',
    };

    if (dateFrom && dateTo) {
      whereCondition.order_date = {
        [db.Sequelize.Op.between]: [dateFrom, dateTo],
      };
    }

    // Aplicar filtro adicional por estado "correct" o "incorrect"
    if (status === "correct") {
      whereCondition.code = {
        [db.Sequelize.Op.in]: [0, 368],
      };
    } else if (status === "incorrect") {
      whereCondition.code = {
        [db.Sequelize.Op.notIn]: [0, 368, 175],
      };
    }

    if (id_shopify) {
      whereCondition.id_shopify = id_shopify;
    }

    if (order_id) {
      whereCondition.order_id = order_id;
    }

    const result = await db.order.findAndCountAll({
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order: [['order_date', 'DESC']],
      where: whereCondition,
      include: {
        model: db.order_items,
      },
    });

    const totalOrders = result.count;
    const totalPages = Math.ceil(totalOrders / pageSize);

    const orders = result.rows.map((order) => {
      const orderData = {
        order_ref: order.order_ref,
        id_shopify: order.id_shopify,
        order_id: order.order_id,
        order_date: order.order_date,
        order_modified: order.order_modified,
        order_status: order.order_status,
        payment_method: order.payment_method,
        transaction_id: order.transaction_id,
        customer_ip_address: order.customer_ip_address,
        customer_user: order.customer_user,
        billing_cedula: order.billing_cedula,
        billing_first_name: order.billing_first_name,
        billing_last_name: order.billing_last_name,
        billing_email: order.billing_email,
        billing_phone: order.billing_phone,
        billing_address_1: order.billing_address_1,
        billing_address_2: order.billing_address_2,
        billing_city: order.billing_city,
        billing_typedcity: order.billing_typedcity,
        billing_zona: order.billing_zona,
        billing_state: order.billing_state,
        billing_country: order.billing_country,
        shipping_first_name: order.shipping_first_name,
        shipping_last_name: order.shipping_last_name,
        shipping_address_1: order.shipping_address_1,
        shipping_address_2: order.shipping_address_2,
        shipping_city: order.shipping_city,
        shipping_typedcity: order.shipping_typedcity,
        shipping_zona: order.shipping_zona,
        shipping_state: order.shipping_state,
        shipping_country: order.shipping_country,
        order_total: order.order_total,
        cupon_code: order.cupon_code,
        code: order.code,
        message: order.message,
        state: order.state,
        shipping_notes: order.shipping_notes,
        location: order.location,
        branch_description: order.branch_description,
        branch_id: order.branch_id,
        latitud: order.lat,
        longitud: order.lng,
        mensaje: order.mensaje,
        order_items: [],
      };

      if (order.order_items && order.order_items.length > 0) {
        orderData.order_items = order.order_items.map((item) => ({
          product_id: item.product_id,
          order_item_name: item.order_item_name,
          sku: item.sku,
          pa_sucursal: item.pa_sucursal,
          unitario_coniva: item.unitario_coniva,
          valor_dcto: item.valor_dcto,
          valor_bruto: item.valor_bruto,
          qty: item.qty,
          line_total: item.line_total,
          cupon_hw: item.cupon_hw,
          cupon_ue: item.cupon_ue,
        }));
      }

      orderData.json = JSON.stringify(orderData, null, 2);

      return orderData;
    });

    res.status(200).json({
      orders: orders,
      totalPages: totalPages,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Ocurrió un error' });
  }
};

exports.downloadExcel = async function (req, res) {
  try {
    const page = req.query.page || 1; // Definir una página predeterminada si no se proporciona
    const pageSize = 5000; // Limitar el número de registros descargados

    const dateFrom = req.query.dateFrom;
    const dateTo = req.query.dateTo;
    const status = req.query.status;
    const id_shopify = req.query.id_shopify;
    const order_id = req.query.order_id;

    const whereCondition = {
      order_status: 'wc-processing',
    };

    if (dateFrom && dateTo) {
      whereCondition.order_date = {
        [db.Sequelize.Op.between]: [dateFrom, dateTo],
      };
    }

    // Aplicar filtro adicional por estado "correct" o "incorrect"
    if (status === "correct") {
      whereCondition.code = {
        [db.Sequelize.Op.in]: [0, 368],
      };
    } else if (status === "incorrect") {
      whereCondition.code = {
        [db.Sequelize.Op.notIn]: [0, 175, 368],
      };
    }

    if (id_shopify) {
      whereCondition.id_shopify = id_shopify;
    }

    if (order_id) {
      whereCondition.order_id = order_id;
    }

    const orders = await db.order.findAndCountAll({
      where: whereCondition,
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order: [['order_date', 'DESC']],
      include: {
        model: db.order_items,
      },
    });

    const result = await Promise.all(orders.rows.map(async (order) => {
      const orderData = {
        order_ref: order.order_ref,
        id_shopify: order.id_shopify,
        order_id: order.order_id,
        order_date: order.order_date,
        order_modified: order.order_modified,
        order_status: order.order_status,
        payment_method: order.payment_method,
        transaction_id: order.transaction_id,
        customer_ip_address: order.customer_ip_address,
        customer_user: order.customer_user,
        billing_cedula: order.billing_cedula,
        billing_first_name: order.billing_first_name,
        billing_last_name: order.billing_last_name,
        billing_email: order.billing_email,
        billing_phone: order.billing_phone,
        billing_address_1: order.billing_address_1,
        billing_address_2: order.billing_address_2,
        billing_city: order.billing_city,
        billing_typedcity: order.billing_typedcity,
        billing_zona: order.billing_zona,
        billing_state: order.billing_state,
        billing_country: order.billing_country,
        shipping_first_name: order.shipping_first_name,
        shipping_last_name: order.shipping_last_name,
        shipping_address_1: order.shipping_address_1,
        shipping_address_2: order.shipping_address_2,
        shipping_city: order.shipping_city,
        shipping_typedcity: order.shipping_typedcity,
        shipping_zona: order.shipping_zona,
        shipping_state: order.shipping_state,
        shipping_country: order.shipping_country,
        order_total: order.order_total,
        cupon_code: order.cupon_code,
        code: order.code,
        message: order.message,
        state: order.state,
        shipping_notes: order.shipping_notes,
        location: order.location,
        branch_description: order.branch_description,
        branch_id: order.branch_id,
        latitud: order.lat,
        longitud: order.lng,
        mensaje: order.mensaje,
        order_items: [],
      };

      if (order.order_items && order.order_items.length > 0) {
        await Promise.all(order.order_items.map(async (item) => {
          orderData.order_items.push({
            product_id: item.product_id,
            order_item_name: item.order_item_name,
            sku: item.sku,
            pa_sucursal: item.pa_sucursal,
            unitario_coniva: item.unitario_coniva,
            valor_dcto: item.valor_dcto,
            valor_bruto: item.valor_bruto,
            qty: item.qty,
            line_total: item.line_total,
            cupon_hw: item.cupon_hw,
            cupon_ue: item.cupon_ue,
          });
        }));
      }

      orderData.json = JSON.stringify(orderData, null, 2);

      return orderData;
    }));

    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet('Orders');

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
    res.setHeader('Content-Disposition', 'attachment; filename=orders.xlsx');

    // Escribir el archivo Excel en la respuesta
    await workbook.xlsx.write(res);

    // Finalizar la respuesta
    res.end();
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Ocurrió un error al descargar el archivo Excel' });
  }
}


exports.ordersRecords = async function (req, res) {
  try {

    const page = req.query.page || 1;
    const pageSize = 100;

    const dateFrom = req.query.dateFrom;
    const dateTo = req.query.dateTo;


    const whereCondition = {
      order_status: 'wc-processing',
    };

    if (dateFrom && dateTo) {
      whereCondition.order_date = {
        [db.Sequelize.Op.between]: [dateFrom, dateTo],
      };
    }

    const countResult = await db.order.count({
      where: whereCondition
    });

    const result = await db.order.findAndCountAll({
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order: [['order_date', 'DESC']],
      where: whereCondition,
      include: {
        model: db.order_items,
      },
    });

    const totalOrders = result.count;
    const totalPages = Math.ceil(totalOrders / pageSize);

    let correctOrders = 0;
    let incorrectOrders = 0;

    const orders = result.rows.map((order) => {
      const orderData = {
        order_ref: order.order_ref,
        id_shopify: order.id_shopify,
        order_id: order.order_id,
        order_date: order.order_date,
        order_modified: order.order_modified,
        order_status: order.order_status,
        payment_method: order.payment_method,
        transaction_id: order.transaction_id,
        customer_ip_address: order.customer_ip_address,
        customer_user: order.customer_user,
        billing_cedula: order.billing_cedula,
        billing_first_name: order.billing_first_name,
        billing_last_name: order.billing_last_name,
        billing_email: order.billing_email,
        billing_phone: order.billing_phone,
        billing_address_1: order.billing_address_1,
        billing_address_2: order.billing_address_2,
        billing_city: order.billing_city,
        billing_typedcity: order.billing_typedcity,
        billing_zona: order.billing_zona,
        billing_state: order.billing_state,
        billing_country: order.billing_country,
        shipping_first_name: order.shipping_first_name,
        shipping_last_name: order.shipping_last_name,
        shipping_address_1: order.shipping_address_1,
        shipping_address_2: order.shipping_address_2,
        shipping_city: order.shipping_city,
        shipping_typedcity: order.shipping_typedcity,
        shipping_zona: order.shipping_zona,
        shipping_state: order.shipping_state,
        shipping_country: order.shipping_country,
        order_total: order.order_total,
        cupon_code: order.cupon_code,
        code: order.code,
        message: order.message,
        state: order.state,
        shipping_notes: order.shipping_notes,
        location: order.location,
        branch_description: order.branch_description,
        branch_id: order.branch_id,
        latitud: order.lat,
        longitud: order.lng,
        mensaje: order.mensaje,
        order_items: [],
      };

      if (order.code === 0 || order.code === 368) {
        correctOrders++;
      } else {
        incorrectOrders++;
      }

      if (order.order_items && order.order_items.length > 0) {
        orderData.order_items = order.order_items.map((item) => ({
          product_id: item.product_id,
          order_item_name: item.order_item_name,
          sku: item.sku,
          pa_sucursal: item.pa_sucursal,
          unitario_coniva: item.unitario_coniva,
          valor_dcto: item.valor_dcto,
          valor_bruto: item.valor_bruto,
          qty: item.qty,
          line_total: item.line_total,
          cupon_hw: item.cupon_hw,
          cupon_ue: item.cupon_ue,
        }));
      }
      return orderData;
    });

    res.status(200).json({
      orders: orders,
      totalOrders: countResult,
      totalPages: totalPages,
      correctOrders: correctOrders,
      incorrectOrders: incorrectOrders
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Ocurrió un error' });
  }
};


exports.detail = async (req, res, next) => {
  const { order_id } = req.query;
  try {
    const oneorder = await db.order.findAndCountAll({
      where: { order_ref: order_id },
      include: {
        model: db.order_items
      }
    });
    if (oneorder.count != 0) {
      res.status(200).json(oneorder);
    } else {
      res.status(404).send({
        error: 'No hay registros en el sistema.'
      });
    }
  } catch (error) {
    res.status(500).send({
      error: '¡Error en el servidor!'
    });
    next(error);
  }
}

exports.modify = async (req, res, next) => {
  try {
    const idToUpdate = req.body.id;
    const newBillingCity = req.body.billing_city;
    const newShippingCity = req.body.shipping_city;
    const newCedula = req.body.billing_cedula
    const newBillingState = req.body.billing_state;
    const newShippingState = req.body.shipping_state;
    const state = req.body.state;
    const order_modified = req.body.order_modified;
    const skus = req.body.skus;
    const inventories = req.body.inventories

    const order = await db.order.findOne({ where: { order_ref: idToUpdate } });

    let envio = '';
    let id_location = '';
    let latitud = '';
    let longitud = '';
    let mensaje = '';

    const billingTypedCity = newBillingCity.toUpperCase();
    const shippingTypedCity = newShippingCity.toUpperCase();
    const billingCountry = req.body.billing_country.toUpperCase();
    const shippingCountry = req.body.shipping_country.toUpperCase();
    const billingDep = newBillingState.toUpperCase();
    const shippingDep = newShippingState.toUpperCase();
    const Adress = req.body.billing_address_1;
    const ShippingAdress = req.body.shipping_address_1;

    console.log('Billing city', billingTypedCity);
    console.log('Shipping city', shippingTypedCity);
    console.log('Billing country', billingCountry);
    console.log('Shipping country', shippingCountry);
    console.log('Billing depto', billingDep);
    console.log('Shipping depto', shippingDep);
    console.log('Billing Address', Adress);
    console.log('Shipping Address', ShippingAdress);

    if (Adress !== ShippingAdress && ShippingAdress !== '') {
      console.log('HA ENTRADO POR SHIPPING');
      const { location, id, lat, lng, id_bodega, msg, city } = await determinarSede(shippingTypedCity, shippingDep, shippingCountry, ShippingAdress, skus, inventories);
      envio = location;
      id_location = id;
      bodega = id_bodega,
      latitud = lat !== null ? lat : 'No Aplica';
      longitud = lng !== null ? lng : 'No Aplica';
      mensaje = msg  !== null ? msg : 'Null - Sin parametrización - Asignación por default';
      ciudad = city;

      console.log('RETORNO ENVIO SHIPPING', envio);
      console.log('RETORNO ID SHIPPING', id_location);
      console.log('RETORNO ID Bodega', bodega);
      console.log('Latitud:', latitud);
      console.log('Longitud:', longitud);
      console.log('MENSAJE', mensaje);
      console.log('CIUDAD', ciudad);

      if (latitud !== 'No Aplica' && longitud !== 'No Aplica') {
        try {
          const dispatchResults = await db.dispatch.findOne({
            where: {
              lat: latitud,
              lng: longitud,
              city: ciudad,
            },
            raw: true
          });
          console.log('Resultados de la consulta a Dispatch:', dispatchResults);
          if (dispatchResults) {
            console.log('Coincidencia encontrada en dispatch:', dispatchResults);
            console.log('RESULTADO DE SUCURSAL', dispatchResults.location_default);
            envio = dispatchResults.location_default;
            id_location = dispatchResults.id_sucursal_default;
            mensaje = 'Reg - Asignación por regla'

          } else {
            envio = location;
            id_location = id;
            mensaje = msg

          }
        } catch (err) {
          console.error('Error ejecutando la consulta', err);
        }
      } else {
        console.log('Latitud y longitud no disponibles para búsqueda en dispatch.');
      }

    } else {
      console.log('HA ENTRADO POR BILLING');
      const { location, id, lat, lng, id_bodega, msg, city } = await determinarSede(billingTypedCity, billingDep, billingCountry, Adress, skus, inventories);
      envio = location;
      id_location = id;
      bodega = id_bodega,
      latitud = lat !== null ? lat : 'No Aplica';
      longitud = lng !== null ? lng : 'No Aplica';
      mensaje = msg !== null ? msg : 'Null - Sin parametrización - Asignación por default'
      ciudad = city;
      console.log('RETORNO ENVIO BILLING', envio);
      console.log('RETORNO ID BILLING', id_location);
      console.log('RETORNO ID Bodega', bodega);
      console.log('Latitud:', latitud);
      console.log('Longitud:', longitud);
      console.log('MENSAJE', mensaje);
      console.log('CIUDAD', ciudad);

      if (latitud !== 'No Aplica' && longitud !== 'No Aplica') {
        try {
          const dispatchResults = await db.dispatch.findOne({
            where: {
              lat: latitud,
              lng: longitud,
              city: ciudad,
            },
            raw: true
          });
          console.log('Resultados de la consulta a Dispatch:', dispatchResults);
          if (dispatchResults) {
            console.log('Coincidencia encontrada en dispatch:', dispatchResults);
            console.log('RESULTADO DE SUCURSAL', dispatchResults.location_default);
            envio = dispatchResults.location_default;
            id_location = dispatchResults.id_sucursal_default;
            mensaje = 'Reg - Asignación por regla'

          } else {
            envio = location;
            id_location = id;
            mensaje = msg
          }
        } catch (err) {
          console.error('Error ejecutando la consulta', err);
        }
      } else {
        console.log('Latitud y longitud no disponibles para búsqueda en dispatch.');
      }
    }

    const envioValue = typeof envio === 'object' ? envio.location : envio;
    const idValue = typeof envio === 'object' ? envio.id : id_location

    console.log('ENVIO', envioValue);
    console.log('ID_LOCATION', idValue);


    if (order) {
      await db.order.update(
        {
          billing_city: newBillingCity,
          shipping_city: newShippingCity,
          billing_cedula: newCedula,
          billing_state: newBillingState,
          shipping_state: newShippingState,
          state,
          order_modified,
          location:envioValue,
          branch_description:envioValue,
          branch_id:idValue,
          lat: latitud,
          lng: longitud,
          mensaje: mensaje,
        },
        { where: { order_ref: idToUpdate } }
      );

      res.status(200).json({ success: 'Campos actualizados con éxito' });
      await postToUrl('https://histoweb.co/Laskinstage/shoservice.asmx/sho_Hook');

    } else {
      // Manejar el caso si no se encontró la orden con el ID proporcionado
      console.error('No se encontró ninguna orden con el ID proporcionado');
      res.status(404).json({ error: 'No se encontró ninguna orden con el ID proporcionado' });
    }
  } catch (error) {
    console.error('Error al actualizar los campos:', error);
    res.status(500).json({ error: 'Error al actualizar los campos' });
  }
};

async function postToUrl(url) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      timeout: 300000,
    });

    if (!response.ok) {
      throw new Error(`¡Error HTTP! Estado: ${response.status}`);
    }

    // Lee el cuerpo de la respuesta como texto
    const responseText = await response.text();

    // Parsea el texto XML
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(responseText);

    // Extrae el valor del elemento 'string'
    const stringValue = result.string._;

    console.log('Respuesta del servidor:', stringValue);

    // Puedes realizar acciones adicionales con la respuesta si es necesario
  } catch (error) {
    console.error('Error durante la solicitud POST a la otra URL:', error);
    throw error;
  }
}

exports.sendHook = async (req, res, next) => {
  try {
    // Realiza la solicitud POST a la URL
    await postToUrl('https://histoweb.co/Laskinstage/shoservice.asmx/sho_Hook');

    // Envía una respuesta JSON indicando que se ha completado
    res.status(200).json({ message: 'La solicitud se ha completado correctamente.' });
  } catch (error) {
    // Manejo de errores si la solicitud falla
    console.error('Error al enviar el hook:', error);
    res.status(500).json({ error: 'Hubo un error al procesar la solicitud.' });
  }
}


///LOCALIZACIÓN

async function determinarSede(billingTypedCity, billingDep, BillingCountry, Adress, skus, inventories) {
  console.log('ENTRA A ANALIZAR LA SEDE');
  console.log('DEPARTAMENTO A ANALIZAR', billingDep);
  console.log('CIUDAD A ANALIZAR', billingTypedCity);
  console.log('DIRECCIÓN A ANALIZAR', Adress);

  const dispatchEntry = await db.dispatch.findOne({
    where: {
      city: billingTypedCity
    }
  });

  if (dispatchEntry) {
    console.log('ENTRA A LA LÓGICA POR GEOLOCALIZACIÓN - #1');
    if (dispatchEntry.geolocation) {
      return determinarSede1(Adress, billingTypedCity, BillingCountry, skus, inventories);
    }
    return { location: dispatchEntry.location, id: dispatchEntry.id_sucursal, lat: null, lng: null, id_bodega: dispatchEntry.id_bodega, msg: 'Reg - Asignación por regla' };
  } else {
    console.log('ENTRA A LA LÓGICA POR DEPARTAMENTO');
    const locationData = await obtenerLocationPorDep(billingDep, BillingCountry);
    return { location: locationData.location, id: locationData.id, lat: null, lng: null, id_bodega: locationData.id_bodega, msg: locationData.msg };
  }
}

async function obtenerLocationPorDep(billingDep, BillingCountry) {
  console.log('ENTRA A LA LOGICA POR DEPTO');
  console.log('PAÍS EN LÓGICA POR DEPARTAMENTO', BillingCountry);
  console.log('DEPARTAMENTO EN LÓGICA POR DEPARTAMENTO', billingDep);

  if (!billingDep) {
    console.log('NO HAY DEPARTAMENTO, ENTRA A LA LÓGICA POR PAÍS');
    return obtenerLocationPorCountry(BillingCountry);
  }


  const dispatchEntry = await db.dispatch.findOne({
    where: {
      department: billingDep,
      city: {
        [Op.or]: ['', null]
      }
    }
  });

  if (dispatchEntry) {
    console.log('NOMBRE SUCURSAL EN LÓGICA POR DEPARTAMENTO', dispatchEntry.location);
    console.log('ID BODEGA EN LÓGICA POR DEPARTAMENTO', dispatchEntry.id_bodega);
    console.log('ID SUCURSAL EN LÓGICA POR DEPARTAMENTO', dispatchEntry.id_sucursal);
    return { location: dispatchEntry.location, id: dispatchEntry.id_sucursal, id_bodega: dispatchEntry.id_bodega, msg: 'Reg - Asignación por regla' };
  } else {
    console.log('NO SE ENCONTRÓ DEPARTAMENTO, APLICA LÓGICA POR PAÍS');
    return obtenerLocationPorCountry(BillingCountry);
  }
}



const countryMapping = {
  "US": "ESTADOS UNIDOS",
  "CANADA": "CANADA",
  "ECUADOR": "ECUADOR",
  "MEXICO": "MEXICO",
  "UNITED KINGDOM": "UNITED KINGDOM"
};

async function obtenerLocationPorCountry(BillingCountry) {
  console.log('ENTRA A LA LÓGICA POR PAIS');
  const countryDBName = countryMapping[BillingCountry] || BillingCountry;
  console.log(countryDBName);
  const dispatchEntry = await db.dispatch.findOne({
    where: {
      country: countryDBName,
      city: {
        [Op.or]: ['', null]
      },
      department: {
        [Op.or]: ['', null]
      },
    }
  });

  if (dispatchEntry) {
    return { location: dispatchEntry.location.toString(), id: dispatchEntry.id_sucursal, id_bodega: dispatchEntry.id_bodega, msg: 'Reg - Asignación por regla' };
  } else {
    console.log('NO HAY PAÍS, ENTRA A LA UBICACIÓN PREDETERMINADA');
    const defaultLocation = await db.location.findOne({
      where: {
        default: 1
      }
    });

    if (defaultLocation) {
      console.log('ID QUE RETORNA', defaultLocation.id_sucursal);
      return { location: defaultLocation.name.toString(), id: defaultLocation.id_sucursal, id_bodega: defaultLocation.location_id_reference, msg: 'Null - Sin parametrización - Asignación por default' };
    } else {
      console.log('NO HAY UBICACIÓN PREDETERMINADA, ENTRA A LA UBICACIÓN DE SEGURIDAD');
      const parameter = await db.parameter.findByPk(3);
      if (parameter) {
        const sede = parameter.token;
        const id = parameter.value;
        console.log('UBICACIÓN DE SEGURIDAD:', sede);
        console.log('ID DE SEGURIDAD:', id);
        return { location: sede.toString(), id: id, msg: 'Null - Sin parametrización - Asignación sede de seguridad' };
      }
    }
  }
}

async function determinarSede1(Adress, billingTypedCity, billingCountry, skus, inventories) {
  console.log('ENTRA A LA LÓGICA POR GEOLOCALIZACIÓN');
  console.log('PAÍS EN LA LÓGICA POR GEOLOCALIZACIÓN', billingCountry);
  console.log('CIUDAD EN LA LÓGICA POR GEOLOCALIZACIÓN', billingTypedCity);
  console.log('DIRECCIÓN EN LA LÓGICA POR GEOLOCALIZACIÓN', Adress);

  console.log('SKUS EN LÓGICA POR GEOLOCALIZACIÓN', skus);
  console.log('INVENTARIOS EN LÓGICA POR GEOLOCALIZACIÓN', inventories);

  try {
    const apiKey = process.env.API_KEY;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(Adress)}&key=${apiKey}&components=locality:${billingTypedCity}country:CO`;

    const respuesta = await axios.get(url);
    const resultados = respuesta.data.results;
    const status = respuesta.data.status;


    console.log('URL', url);
    console.log('RESULTADOS', resultados);

    if (status !== "OK" || resultados.length === 0) {
      throw new Error(`Geocoding API error: ${respuesta.data.error_message || 'Unknown error'}`);
    }

    const location_type = resultados[0].geometry.location_type;
    const partial_match = resultados[0].partial_match;
    const plus_code = resultados[0].plus_code

    const locations = await db.location.findAll({
      where: {
        city: billingTypedCity.toUpperCase(),
        active: 1
      }
    });

    const plainLocations = locations.map(location => location.get({ plain: true }));

    console.log(location_type);
    console.log(partial_match);
    //console.log('LONG NAME', resultados[0].address_components[0].long_name);

    console.log('PLUS CODE', plus_code);
    const addressRegex = /^(?=.*[A-Za-z])(?=.*\d)/;

    console.log('DIRECCION LIMPIA', addressRegex.test(Adress));

    if (
      addressRegex.test(Adress) &&
      resultados && resultados.length > 0 &&
      plainLocations.length > 0
    ) {
      console.log('SI ENCONTRÓ RESULTADO PARA LOCALIZAR');
      const ubicacion = resultados[0].geometry.location;
      const coordenadas = { latitud: ubicacion.lat, longitud: ubicacion.lng };

      console.log('ENTRA A CALCULO DE LOCALIZACIÓN');
      const distancias = plainLocations.map(location => {
        const distancia = Math.sqrt(
          Math.pow(coordenadas.latitud - parseFloat(location.latitude), 2) +
          Math.pow(coordenadas.longitud - parseFloat(location.longitude), 2)
        );
        return { ...location, distance: distancia };
      });

      distancias.sort((a, b) => a.distance - b.distance);

      console.log('Sedes ordenadas por distancia:', distancias.map(location => location.name));

      // Buscar sede con inventario o que permita vender sin stock
      const resultadoSede = await buscarSedeConInventarioCercana(distancias, skus, inventories, billingTypedCity);
      if (resultadoSede) {
        const { location, msg, city } = resultadoSede;
        return { location: location.name, id: location.id_sucursal, id_bodega: location.location_id_reference, lat: coordenadas.latitud, lng: coordenadas.longitud, msg, city };
      } else {
        // Si no se encuentran más sedes con inventario, retorna la sede predeterminada o la sede de seguridad
        console.log('No se encontraron más sedes cercanas con inventario. Se asigna la sede por defecto o la sede de seguridad.');
        const defaultLocation = await db.location.findOne({
          where: {
            default: true
          }
        });
        if (defaultLocation) {
          return {
            location: defaultLocation.name,
            id: defaultLocation.id_sucursal,
            id_bodega: defaultLocation.location_id_reference,
            lat: coordenadas.latitud,
            lng: coordenadas.longitud,
            msg: 'Geo - Asignación por coordenadas sin inventario',
            city: defaultLocation.city
          };
        } else {
          // Si no hay una sede predeterminada, retorna la sede de seguridad
          console.log('No se encontró una sede por defecto. Se asigna la sede de seguridad.');
          const parameter = await db.parameter.findByPk(3);
          if (parameter) {
            return { location: parameter.token, id: parameter.value, lat: "No aplica", lng: "No aplica", msg: 'Geo - Asignación por coordenadas sin inventario ni ubicación predeterminada' };
          } else {
            console.log('No se encontró ubicación predeterminada en la tabla de ubicaciones.');
            return 'Tampoco hay valor por defecto';
          }
        }
      }

    } else {
      console.log('NO ENCONTRÓ RESULTADO PARA GEOLOCALIZAR, APLICA UBICACIÓN PRDETERMINADA');
      const defaultLocation = await db.location.findOne({
        where: {
          default: 1
        }
      });
      if (defaultLocation) {
        console.log('ID QUE RETORNA', defaultLocation.id_sucursal);
        return {
          location: defaultLocation.name.toString(),
          id: defaultLocation.id_sucursal,
          id_bodega: defaultLocation.location_id_reference,
          lat: "No aplica",
          lng: "No aplica",
          msg: 'Null - Dirección no interpretada - Asignación por default'
        };
      } else {
        console.log('ENTRA A LA SEDE DE SEGURIDAD');
        const parameter = await db.parameter.findByPk(3);
        if (parameter) {
          const sede = parameter.token;
          const id = parameter.value;
          console.log('NOMBRE SEDE DE SEGURIDAD:', sede);
          console.log('ID SEDE DE SEGURIDAD', id);
          return {
            location: sede.toString(),
            id: id,
            id_bodega: null,
            lat: "No aplica",
            lng: "No aplica",
            msg: 'Null - Dirección no interpretada - Asignación sede de seguridad'
          };
        }
      }
    }
  } catch (error) {
    const apiKey = process.env.API_KEY;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(Adress)}&key=${apiKey}&components=locality:${billingTypedCity}country:CO`;

    const respuesta = await axios.get(url);
    const resultados = respuesta.data.results;
    const status = respuesta.data.status;
    console.log('RESULTADOS XXX', status);
    const mensaje1 = status === 'REQUEST_DENIED' ? 'Null - API de Google no disponible - Asignación sede de seguridad' : 'Null - Dirección no interpretada - Asignación sede de seguridad';
    const mensaje2 = status === 'REQUEST_DENIED' ? 'Null - API de Google no disponible - Asignación por default' : 'Null - Dirección no interpretada - Asignación por default';

    console.error('Error al determinar dirección:', error.message);
    const defaultLocation = await db.location.findOne({
      where: {
        default: 1
      }
    });
    if (defaultLocation) {
      console.log('ID QUE RETORNA', defaultLocation.id_sucursal);
      return {
        location: defaultLocation.name.toString(),
        id: defaultLocation.id_sucursal, id_bodega: defaultLocation.location_id_reference,
        lat: "No aplica",
        lng: "No aplica",
        msg: mensaje2
      };
    } else {
      console.log('ENTRA A LA SEDE DE SEGURIDAD');
      const parameter = await db.parameter.findByPk(3);
      if (parameter) {
        const sede = parameter.token;
        const id = parameter.value;
        console.log('NOMBRE SEDE DE SEGURIDAD:', sede);
        console.log('ID SEDE DE SEGURIDAD', id);
        return {
          location: sede.toString(),
          id: id, id_bodega: null,
          lat: "No aplica",
          lng: "No aplica",
          msg: mensaje1
        };
      }
    }
  }
}


async function buscarSedeConInventarioCercana(locations, skus, inventories, billingTypedCity) {
  // Imprimir los datos de entrada para verificar su estructura y tipo
  console.log('Datos de entrada:');
  console.log('locations:', JSON.stringify(locations, null, 2));
  console.log('skus:', JSON.stringify(skus, null, 2));
  console.log('inventories:', JSON.stringify(inventories, null, 2));
  console.log('Tipo de inventories:', typeof inventories);
  console.log('BILLING TIPED CITY EN FUNCION DE INVENTARIO', billingTypedCity);

  // Verificar que skus e inventories tienen la misma longitud
  if (!Array.isArray(skus) || !Array.isArray(inventories) || skus.length !== inventories.length) {
    console.error('Error: skus e inventories deben ser arreglos de la misma longitud.');
    return null;
  }

  // Crear un mapa para almacenar las cantidades necesarias por SKU
  const skuQuantities = {};
  for (let i = 0; i < skus.length; i++) {
    skuQuantities[skus[i]] = inventories[i];
  }

  console.log(`Cantidad requerida por SKU: ${JSON.stringify(skuQuantities, null, 2)}`);

  for (const location of locations) {
    console.log(`Verificando sede: ${location.name}, ID: ${location.id_sucursal}, Distancia: ${location.distance}`);

    // Obtén los registros de inventario para la sede actual y los SKUs proporcionados
    const inventoryRecords = await db.inventory.findAll({
      where: {
        sku: skus,
        location_id_reference: location.location_id_reference
      }
    });

    // Mostrar los detalles de inventario encontrados para la sede actual
    console.log(`Inventario encontrado en ${location.name}:`);
    inventoryRecords.forEach(record => {
      console.log(`SKU: ${record.sku}, Cantidad disponible: ${record.available_reference}`);
    });

    // Verificar si todos los SKUs tienen suficiente inventario
    const hasSufficientInventory = skus.every(sku => {
      const requiredQuantity = skuQuantities[sku];
      const availableRecord = inventoryRecords.find(record => record.sku === sku);
      return availableRecord && availableRecord.available_reference >= requiredQuantity;
    });

    if (hasSufficientInventory) {
      console.log(`Inventario suficiente en ${location.name}`);
      return { location, msg: 'Geo - Asignación por coordenadas e inventario', city: billingTypedCity }; // Retorna la sede con inventario y mensaje
    }

    // Verificar si la sede permite vender sin stock
    if (location.no_stock === true) {
      console.log(`La sede ${location.name} permite ventas sin stock.`);
      return { location, msg: 'Geo - Asignación por coordenadas sin inventario', city: billingTypedCity }; // Retorna la sede que permite vender sin inventario y mensaje
    }
  }

  console.log('No se encontraron sedes cercanas con inventario o permitiendo ventas sin stock.');
  return null; // Si no se encuentra ninguna sede con inventario o permitiendo ventas sin stock
}



