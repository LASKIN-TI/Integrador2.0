const db = require('./models');
const axios = require('axios');
const getEncryptedText = require('./Encrypt');
const xml2js = require('xml2js');
const plaintext = process.env.TOKEN;
const { Op } = require('sequelize');


exports.handler = function (headers, body, webhook) {
  console.log('body', body)
  console.log('headers', headers)
  console.log({ webhook });

  return new Promise(async (resolve, _) => {
    let response;

    switch (webhook) {
      // Caso para crear un producto
      case 'createproduct':
        response = await createProduct(body);
        break;
      // Caso para actualizar un producto
      case 'updateproduct':
        response = await updateProduct(body);
        break;
      // Caso para crear una órden
      case 'createorder':
        response = await createorder(body);
        break;
      // Caso para actualizar una órden
      case 'updateorder':
        response = await updateorder(body);
        break;
      // Productos de HW con formato Shopify
      case 'productshw':
        response = await productsHW()
        break;
      // Productos locales con formato Shopify
      case 'products':
        response = await products()
        break;
      // Procedimientos de HW con formato Shopify
      case 'procedureshw':
        response = await proceduresHW()
        break;
      // Procedimientos locales con formato Shopify
      case 'procedures':
        response = await procedures()
        break;
      // Caso de creación de transacción
      case 'createtransaction':
        response = await createtransaction(body);
        break;
      // Caso para exponer las órdenes pendientes
      case 'orders':
        response = await orders();
        break;
      // Caso para actualizar los valores de las órdenes
      case 'modifyorder':
        response = await modifyOrder(body);
        break;
    }
    resolve(response);
  });
}

//Función auxiliar para ajustar fecha
function formatDate(dateString) {
  const date = new Date(dateString);

  // Ajustar la fecha y hora al huso horario de Colombia (UTC-5)
  date.setUTCHours(date.getUTCHours() - 5);

  const year = date.getUTCFullYear();
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = date.getUTCDate().toString().padStart(2, '0');
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  const seconds = date.getUTCSeconds().toString().padStart(2, '0');

  return `${year}.${month}.${day} ${hours}:${minutes}:${seconds}`;
}

// Funcón auxiliar para redondear precios
function redondeoPersonalizado(numero) {
  const entero = Math.floor(numero); // Redondea hacia abajo (al menor)
  const decimal = numero - entero;

  if (decimal >= 0.5) {
    return entero + 1; // Redondea hacia arriba (al mayor)
  } else {
    return entero;
  }
}

//Departamentos mapeados
const deptoMapping = {
  "Amazonas": "AMAZONAS",
  "Valle del Cauca": "VALLE DEL CAUCA",
  "Bogotá, D.C.": "BOGOTA D.C",
  "Antioquia": "ANTIOQUIA",
  "Arauca": "ARAUCA",
  "Atlántico": "ATLANTICO",
  "Bolívar": "BOLIVAR",
  "Boyacá": "BOYACA",
  "Caldas": "CALDAS",
  "Caquetá": "CAQUETA",
  "Casanare": "CASANARE",
  "Cauca": "CAUCA",
  "Cesar": "CESAR",
  "Chocó": "CHOCO",
  "Córdoba": "CORDOBA",
  "Cundinamarca": "CUNDINAMARCA",
  "Guainía": "GUAINIA",
  "Guaviare": "GUAVIARE",
  "Huila": "HUILA",
  "La Guajira": "LA GUAJIRA",
  "Magdalena": "MAGDALENA",
  "Meta": "META",
  "Nariño": "NARINO",
  "Norte de Santander": "NORTE DE SANTANDER",
  "Putumayo": "PUTUMAYO",
  "Quindío": "QUINDIO",
  "Risaralda": "RISARALDA",
  "San Andrés, Providencia y Santa Catalina": "'ARCHIPIELAGO DE SAN ANDRES, PROVIDENCIA Y SANTA CATALINA'",
  "Santander": "SANTANDER",
  "Sucre": "SUCRE",
  "Tolima": "TOLIMA",
  "Vaupés": "VAUPES",
  "Vichada": "VICHADA"
};

// Función para realizar la conversión
function convertDepto(inputDepto) {
  const formattedDepto = deptoMapping[inputDepto] || inputDepto;
  return formattedDepto;
}

// Función para crear una transacción
async function createtransaction(transactionData) {
  try {
    // Valida que sea un objeto
    if (typeof transactionData !== 'object' || Object.keys(transactionData).length === 0) {
      console.log('Objeto de producto inválido o vacío.');
      return;
    }

    // Se configuran los campos
    const createdTransaction = await db.transaction.create({
      id_transaction: transactionData.id,
      order_id: transactionData.order_id,
      created_at: transactionData.created_at,
      gateway: transactionData.gateway,
      payment_id: transactionData.payment_id,
      amount: transactionData.amount,
    });

    // Retorno de mensaje
    console.log('Se creó la transacción con éxito');
    return { status: 200, message: 'Transacción creada con éxito.' };
  } catch (error) {
    console.log('¡Error creando la transacción');
    return { status: 500, message: 'Error en el servidor.' };
  }
};


// Función para crear un producto
async function createProduct(productData) {
  try {
    // Valida que sea un objeto
    if (typeof productData !== 'object' || Object.keys(productData).length === 0) {
      console.log('Objeto de producto inválido o vacío.');
      return;
    }

    // Configuración de los campos
    const createdProduct = await db.product.create({
      product_id: productData.id,
      title: productData.title,
      status: productData.status,
      product_type: productData.product_type,
      body_html: productData.body_html,
      vendor: productData.vendor,
      tags: productData.tags,
      published_at: productData.published_at || '',
      inventory_policy: productData.variants[0].inventory_policy,
      inventory_management: productData.variants[0].inventory_management,
      price: productData.variants[0].price,
      compare_at_price: productData.variants[0].compare_at_price,
      inventory_quantity: productData.variants[0].inventory_quantity,
      requires_shipping: productData.variants[0].requires_shipping,
      inventory_item_id: productData.variants[0].inventory_item_id,
      sku: productData.variants[0].sku,
      barcode: productData.variants[0].barcode,
      taxable: productData.variants[0].taxable,
      weight: productData.variants[0].weight
    });

    // Configuración de los campos del registro
    const newRecord = await db.record.create({
      message: "Creado",
      product_type: productData.product_type,
      product_id: productData.id,
      sku: productData.variants[0].sku,
      title: productData.title,
      product_type: productData.product_type,
      body_html: productData.body_html,
      vendor: productData.vendor,
      status: productData.status,
      price: productData.variants[0].price,
      compare_at_price: productData.variants[0].compare_at_price,
      tags: productData.tags,
      inventory_quantity: productData.variants[0].inventory_quantity,
      requires_shipping: productData.variants[0].requires_shipping,
      inventory_management: productData.variants[0].inventory_management,
      inventory_policy: productData.variants[0].inventory_policy,
      type: 1,
      date_act: formatDate(productData.updated_at),
      date_crea: formatDate(productData.created_at)
    });

    // Retorno de mensaje
    console.log(`Se creó el producto con éxito.`);
    console.log(createdProduct);
    return { status: 200, message: 'Producto creado con éxito.' };
  } catch (error) {
    // En caso de error se genera los campos
    const newRecord = await db.record.create({
      message: "Error en la creación del producto",
      type: 1,
      product_type: productData.product_type,
      product_id: productData.id,
      sku: productData.variants[0].sku,
      title: productData.title,
      product_type: productData.product_type,
      body_html: productData.body_html,
      vendor: productData.vendor,
      status: productData.status,
      price: productData.variants[0].price,
      compare_at_price: productData.variants[0].compare_at_price,
      tags: productData.tags,
      inventory_quantity: productData.variants[0].inventory_quantity,
      requires_shipping: productData.variants[0].requires_shipping,
      inventory_management: productData.variants[0].inventory_management,
      inventory_policy: productData.variants[0].inventory_policy,
      date_act: formatDate(productData.updated_at),
      date_crea: formatDate(productData.created_at)
      //response_status: res.statusCode,
    });
    console.log('¡Error en el servidor!');
    console.log(error);
    return { status: 500, message: 'Error en el servidor.' };
  }
};


// Función auxiliar para geolocalizar 
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
    //Si enceuntra configuración - parametrización
    console.log('ENTRA A LA LÓGICA POR GEOLOCALIZACIÓN - #1');
    if (dispatchEntry.geolocation) {
      return determinarSede1(Adress, billingTypedCity, BillingCountry, skus, inventories);
    }
    return { location: dispatchEntry.location, id: dispatchEntry.id_sucursal, lat: null, lng: null, id_bodega: dispatchEntry.id_bodega, msg: 'Reg - Asignación por regla' };
  } else {
    //Si NO enceuntra configuración - parametrización
    console.log('ENTRA A LA LÓGICA POR DEPARTAMENTO');
    const locationData = await obtenerLocationPorDep(billingDep, BillingCountry);
    return { location: locationData.location, id: locationData.id, lat: null, lng: null, id_bodega: locationData.id_bodega, msg: locationData.msg };
  }
}


// Función para geolocalizar por departamento
async function obtenerLocationPorDep(billingDep, BillingCountry) {
  console.log('ENTRA A LA LOGICA POR DEPTO');
  console.log('PAÍS EN LÓGICA POR DEPARTAMENTO', BillingCountry);
  console.log('DEPARTAMENTO EN LÓGICA POR DEPARTAMENTO', billingDep);

  // Si no hay valor de departamento entra a geolocalizar por país
  if (!billingDep) {
    console.log('NO HAY DEPARTAMENTO, ENTRA A LA LÓGICA POR PAÍS');
    return obtenerLocationPorCountry(BillingCountry);
  }


  // Si hay parametrización retorna el valor 
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
    // Si no hay parametrización entra a geolocalizar por país
    console.log('NO SE ENCONTRÓ DEPARTAMENTO, APLICA LÓGICA POR PAÍS');
    return obtenerLocationPorCountry(BillingCountry);
  }
}


// Conversión de los paises
const countryMapping = {
  "UNITED STATES": "ESTADOS UNIDOS",
  "CANADA": "CANADA",
  "ECUADOR": "ECUADOR",
  "MEXICO": "MEXICO",
  "UNITED KINGDOM": "UNITED KINGDOM"
};

// Función para geolocalizar por país
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

  // Si hay parametrización retorna el valor
  if (dispatchEntry) {
    return { location: dispatchEntry.location.toString(), id: dispatchEntry.id_sucursal, id_bodega: dispatchEntry.id_bodega, msg: 'Reg - Asignación por regla' };
  } else {
    console.log('NO HAY PAÍS, ENTRA A LA UBICACIÓN PREDETERMINADA');
    const defaultLocation = await db.location.findOne({
      where: {
        default: 1
      }
    });

    // Si no hay retorna la ubicación predeterminada
    if (defaultLocation) {
      console.log('ID QUE RETORNA', defaultLocation.id_sucursal);
      return { location: defaultLocation.name.toString(), id: defaultLocation.id_sucursal, id_bodega: defaultLocation.location_id_reference, msg: 'Null - Sin parametrización - Asignación por default' };
    } else {
      // Si no hay retorna la ubicación de seguridad
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




async function buscarDesCity(city) {
  console.log('BUSCAR CIUDAD - CIUDAD:', city);
  try {
    const result = await db.city.findOne({
      where: {
        city: city.toUpperCase()
      }
    });

    if (result && result.desc_city !== undefined) {
      const desCity = result.desc_city;
      console.log('RESULTADO ENCONTRADO:', desCity);
      return desCity;
    } else {
      console.log('RESULTADO NO ENCONTRADO');
      return city;
    }
  } catch (error) {
    console.error("ERROR AL BUSCAR EN LA BASE DE DATOS:", error);
    throw error;
  }
}

async function searchCity(cityName, departmentDesc) {
  console.log('CIUDAD EN LA FUNCION:', cityName);

  // Remover comas, tildes y el punto final del nombre del departamento
  let cleanDepartmentDesc = departmentDesc
    .replace(/,/g, '')  // Elimina las comas
    .normalize('NFD')    // Normaliza los caracteres con tildes
    .replace(/[\u0300-\u036f]/g, ''); // Elimina los diacríticos (tildes)

  // Remover el punto solo si está al final de la cadena
  if (cleanDepartmentDesc.endsWith('.')) {
    cleanDepartmentDesc = cleanDepartmentDesc.slice(0, -1);
  }

  console.log('DEPARTAMENTO EN LA FUNCION (LIMPIO):', cleanDepartmentDesc);

  try {
    // Logueamos los criterios de búsqueda antes de ejecutarla
    console.log('Buscando con cityName:', cityName, 'y cleanDepartmentDesc:', cleanDepartmentDesc);

    const city = await db.city.findOne({
      where: {
        city: cityName,
        desc_department: cleanDepartmentDesc, // Usamos el nombre del departamento sin comas, tildes ni punto final
      },
    });

    if (city) {
      console.log('ENTRA EN EL IF DE LA FUNCION, ciudad encontrada:', city);
      return city.desc_city;
    } else {
      console.log('ENTRA EN EL ELSE, no se encontró la ciudad');
      return 'ERROR';
    }

  } catch (error) {
    console.log('ENTRA EN EL ERROR');
    console.error('Error finding city description:', error);
    throw error;
  }
}


//ORDER
async function createorder(order) {
  let orderTotal = 0;
  let shippingValue = 0;

  try {

    if (!order || typeof order !== 'object' || Object.keys(order).length === 0) {
      return { error: 'Objeto de orden inválido o vacío.' }
    }

    if (!order.line_items || order.line_items.length === 0) {
      return { error: 'La orden debe contener al menos un item (order_item)' }
    }

    if (order.discount_applications && order.discount_applications.length > 0 && (!order.discount_codes || order.discount_codes.length === 0)) {
      for (const lineItem of order.line_items) {
        const lineTotal = ((lineItem.price) * (lineItem.quantity));
        orderTotal = redondeoPersonalizado(orderTotal + lineTotal);
      }
    } else {
      for (const lineItem of order.line_items) {
        const lineTotal = ((lineItem.price) * (lineItem.quantity));
        orderTotal = redondeoPersonalizado(orderTotal + lineTotal);
      }
    }

    // Resta data.totalDescuento del orderTotal
    if (order.discount_applications && order.discount_applications.length > 0 && (order.discount_applications[0].type === 'automatic' || order.discount_codes[0].code.startsWith('FX'))) {
      if (order.discount_codes.length === 0 || order.discount_codes[0].code.startsWith('FX')) {
        for (const lineItem of order.line_items) {
          orderTotal = redondeoPersonalizado(orderTotal - (lineItem.discount_allocations[0]?.amount || 0));
        }
      } else {
        for (const lineItem of order.line_items) {
          if (lineItem.discount_allocations.length > 1) {
            orderTotal = redondeoPersonalizado(orderTotal - (lineItem.discount_allocations[0]?.amount || 0));
          }
        }
      }
    }

    shippingValue = parseFloat(order.total_shipping_price_set.shop_money.amount);
    const shippingAddress = order.shipping_address;


    const billing_address = order.billing_address.address1;
    const shipping_address = shippingAddress ? shippingAddress.address1 || '' : '';


    var shipping_first_name1 = '';
    var shipping_last_name1 = '';
    var shipping_address_11 = '';
    var shipping_address_21 = '';
    var shipping_city1 = '';
    var shipping_zona = '';
    var shipping_zona1 = 'W';
    var shipping_zona2 = '';
    var shipping_state1 = '';
    var shipping_typedcity = '';
    var shipping_country_code = '';
    var shipping_country_code2 = '';

    var billing_zona1 = 'W';

    const billing_zone = order.billing_address.zip;
    const shipping_zone = shippingAddress ? shippingAddress.zip || '' : '';

    if (billing_zone === 'SUR' || billing_zone === '1' || billing_zone === '1.SUR' || billing_zone === '1. SUR') {
      billing_zona1 = 'W'
    } else if (billing_zone === 'NORTE' || billing_zone === '2' || billing_zone === '2.NORTE' || billing_zone === '2. NORTE') {
      billing_zona1 = 'W'
    } else if (billing_zone === 'OESTE' || billing_zone === '4' || billing_zone === '4.OESTE' || billing_zone === '4. OESTE') {
      billing_zona1 = 'W'
    } else if (billing_zone === 'ESTE' || billing_zone === '5' || billing_zone === '5.ESTE' || billing_zone === '5. ESTE') {
      billing_zona1 = 'W'
    }

    if (shipping_zone === 'SUR' || shipping_zone === '1' || shipping_zone === '1.SUR' || shipping_zone === '1. SUR') {
      shipping_zona1 = 'W'
    } else if (shipping_zone === 'NORTE' || shipping_zone === '2' || shipping_zone === '2.NORTE' || shipping_zone === '2. NORTE') {
      shipping_zona1 = 'W'
    } else if (shipping_zone === 'OESTE' || shipping_zone === '4' || shipping_zone === '4.OESTE' || shipping_zone === '4. OESTE') {
      shipping_zona1 = 'W'
    } else if (shipping_zone === 'ESTE' || shipping_zone === '5' || shipping_zone === '5.ESTE' || shipping_zone === '5. ESTE') {
      shipping_zona1 = 'W'
    }

    var shipping_country = order.shipping_address ? order.shipping_address.country || '' : '';

    // Utilizamos una estructura condicional para asignar el código correspondiente
    if (shipping_country === "Colombia") {
      shipping_country_code = "CO";
    } else if (shipping_country === "United States") {
      shipping_country_code = "US";
    } else if (shipping_country === "Ecuador") {
      shipping_country_code = "EC";
    } else {
      shipping_country_code = ''; // Set to empty string when country is not available
    }


    if (billing_address != shipping_address) {
      shipping_first_name1 = shippingAddress ? shippingAddress.first_name || '' : '';
      shipping_last_name1 = shippingAddress ? shippingAddress.last_name || '' : '';
      shipping_address_11 = shippingAddress ? shippingAddress.address1 || '' : '';
      shipping_address_21 = shippingAddress ? shippingAddress.address2 || '' : '';
      shipping_city1 = shippingAddress ? await searchCity((shippingAddress.city || '').toUpperCase(), shippingAddress.province.toUpperCase()) : '';
      shipping_state1 = shippingAddress ? shippingAddress.province || '' : '';
      shipping_zona = shipping_zona1;
      shipping_typedcity = shippingAddress ? shippingAddress.city || '' : '';
      shipping_country_code = shipping_country_code;
    } else {
      shipping_zona = shipping_zona2;
      shipping_country_code = shipping_country_code2;

    }

    for (const lineItem of order.line_items) {
      const sku = lineItem.sku || '';
      if (!sku.startsWith("U") && shipping_zone === '') {
        shipping_zona = '';
        break;
      }
    }

    let shippingNotes = ""; // Inicializa shippingNotes como una cadena vacía por defecto


    if (order.line_items && order.line_items.length > 0) {
      for (const lineItem of order.line_items) {
        if (lineItem.properties && lineItem.properties.length > 0) {
          // Verifica si 'properties' en 'lineItem' existe y tiene elementos
          for (const property of lineItem.properties) {
            if (property.name === "_Sube tu fórmula médica:") {
              shippingNotes = property.value; // Asigna el valor a shippingNotes
              break; // Sale del bucle si encuentra la propiedad deseada
            }
          }
        }
      }
    }



    let cupon_code = "";

    if (order.discount_codes.length > 1) {
      cupon_code = order.discount_codes[1].code;
    } else if (order.discount_codes.length === 1) {
      cupon_code = order.discount_codes[0].code;
    }

    if (cupon_code.startsWith("FX")) {
      cupon_code = "";
    }

    const transaction = await db.transaction.findOne({
      where: {
        order_id: order.id,
      },
      order: [['created_at', 'DESC']],
      limit: 1,
    });

    // Obtén el transaction_id si se encontró una transacción
    const paymentId = transaction ? transaction.payment_id : null;

    var billing_country = order.billing_address.country;
    var billing_country_code

    var billing_state1 = convertDepto(order.billing_address.province);

    if (billing_country === "Colombia") {
      billing_country_code = "CO";
    } else if (billing_country === "United States") {
      billing_country_code = "US";
    } else if (billing_country === "Ecuador") {
      billing_state1 = 'NO APLICA';
      billing_country_code = "EC";
    } else {
      billing_country_code = order.billing_address.country;
    }

    let envio = '';
    let id_location = '';
    let latitud = '';
    let longitud = '';
    let mensaje = '';
    let ciudad = '';

    const billingTypedCity = await buscarDesCity(order.billing_address.city.toUpperCase());

    let city;
    if (order.shipping_address && order.shipping_address.city) {
      city = order.shipping_address.city.toUpperCase();
    } else if (order.billing_address && order.billing_address.city) {
      city = order.billing_address.city.toUpperCase();
    }
    const shippingTypedCity = await buscarDesCity(city);


    const billingCountry = order.billing_address.country.toUpperCase();

    let country;
    if (order.shipping_address && order.shipping_address.country) {
      country = order.shipping_address.country.toUpperCase();
    } else if (order.billing_address && order.billing_address.country) {
      country = order.billing_address.country.toUpperCase();
    }
    const shippingCountry = country;

    //const shippingCountry = order.shipping_address.country.toUpperCase();

    const billingDep = order.billing_address.province ? order.billing_address.province.toUpperCase() : '';

    let province;
    if (order.shipping_address && order.shipping_address.province) {
      province = order.shipping_address.province.toUpperCase();
    } else if (order.billing_address && order.billing_address.province) {
      province = order.billing_address.province.toUpperCase();
    }
    const shippingDep = province;
    //const shippingDep = order.shipping_address.province ? order.billing_address.province.toUpperCase() : '';

    const Adress = order.billing_address.address1
    const ShippingAdress = order.shipping_address ? order.shipping_address.address1 : '';

    const skus = order.line_items.map(item => item.sku);
    const inventories = order.line_items.map(item => item.quantity)

    const result = order.line_items.filter(item => item.sku.startsWith('U')).map(item => ({
      sku: item.sku,
      inventory: item.quantity
    }));

    const skusFiltrados = result.map(item => item.sku);
    const inventoriesFiltrados = result.map(item => item.inventory);

    console.log('SKUS QUE PASAN:', skusFiltrados);

    console.log('SHIPPPPPPING', shippingAddress);

    if (shippingAddress != null && billing_address != shipping_address) {
      console.log('HA ENTRADO POR SHIPPING');
      const { location, id, lat, lng, id_bodega, msg, city } = await determinarSede(shippingTypedCity, shippingDep, shippingCountry, ShippingAdress, skusFiltrados, inventoriesFiltrados);
      envio = location;
      id_location = id;
      bodega = id_bodega,
        latitud = lat !== null ? lat : 'No Aplica';
      longitud = lng !== null ? lng : 'No Aplica';
      mensaje = msg;
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
      const { location, id, lat, lng, id_bodega, msg, city } = await determinarSede(billingTypedCity, billingDep, billingCountry, Adress, skusFiltrados, inventoriesFiltrados);
      envio = location;
      id_location = id;
      bodega = id_bodega,
        latitud = lat !== null ? lat : 'No Aplica';
      longitud = lng !== null ? lng : 'No Aplica';
      mensaje = msg;
      ciudad = city
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

    //RESULTADO FINAL
    console.log('ENVIOOOO', envioValue);
    console.log('ID_LOCATIOOON', idValue);

    const createdOrder = await db.order.create({
      order_ref: order.id,
      id_shopify: order.name,
      order_date: formatDate(order.created_at),
      order_modified: formatDate(order.updated_at),

      order_status: order.financial_status === 'paid' ? 'wc-processing' : order.order_status,


      payment_method: order.payment_gateway_names.length > 1
        ? order.payment_gateway_names[1] === 'Wompi' || order.payment_gateway_names[1] === 'bogus'
          ? 'wompi_wwp'
          : order.payment_gateway_names[1] === 'Addi Payment'
            ? 'addi'
            : payment_method
        : order.payment_gateway_names[0] === 'Wompi' || order.payment_gateway_names[0] === 'bogus'
          ? 'wompi_wwp'
          : order.payment_gateway_names[0] === 'Addi Payment'
            ? 'addi'
            : payment_method,

      transaction_id: paymentId || order.confirmation_number,

      customer_ip_address: order.browser_ip,
      customer_user: order.customer.id,
      billing_cedula: /^[0-9]+$/.test(order.billing_address.company)
        ? order.billing_address.company
        : '',
      billing_first_name: order.billing_address.first_name,
      billing_last_name: order.billing_address.last_name,
      billing_email: order.customer.email,
      billing_phone: order.billing_address.phone
        ? order.billing_address.phone.replace(/\s/g, '')
        : order.shipping_address.phone
          ? order.shipping_address.phone.replace(/\s/g, '')
          : '',
      billing_address_1: order.billing_address.address1,
      billing_address_2: order.billing_address.address2 !== null ? order.billing_address.address2 : '',
      billing_city: order.billing_address.country_code === 'CO'
        ? await searchCity(order.billing_address.city.toUpperCase(), order.billing_address.province.toUpperCase())
        : order.billing_address.city.toUpperCase(),

      billing_typedcity: order.billing_address.city,
      billing_zona: billing_zona1,
      billing_state: billing_state1 || order.billing_address.city.toUpperCase(),
      billing_country: billing_country_code,
      shipping_first_name: shipping_first_name1,
      shipping_last_name: shipping_last_name1,
      shipping_address_1: shipping_address_11,
      shipping_address_2: shipping_address_21,
      shipping_city: shipping_city1,
      shipping_typedcity: shipping_typedcity,
      shipping_zona: shipping_zona,
      shipping_state: convertDepto(shipping_state1),
      shipping_country: shipping_country_code,
      order_total: orderTotal + shippingValue,
      order_shipping: shippingValue,
      cupon_code: cupon_code,
      state: 0,
      code: 0,
      message: 'SIN PROCESAR',
      order_id: 'SIN ASIGNAR',
      status_hook: 0,
      shipping_notes: shippingNotes,
      location: envioValue,
      branch_description: envioValue,
      branch_id: idValue,
      lat: latitud,
      lng: longitud,
      mensaje: mensaje
    });

    let billingDeptResult = ''
    let shippingDeptResult = ''

    const billingCity = await db.city.findOne({ where: { city: createdOrder.billing_city } });
    const shippingCity = await db.city.findOne({ where: { city: createdOrder.shipping_city } });

    billingDeptResult = await db.city.findOne({ where: { city: createdOrder.billing_city } });
    shippingDeptResult = await db.city.findOne({ where: { city: createdOrder.shipping_city } });

    if (createdOrder.billing_country != 'CO') {
      if (billingDeptResult != null) {
        if (createdOrder.billing_state === billingDeptResult.desc_department) {
          createdOrder.billing_city = billingCity ? billingCity.desc_city : createdOrder.billing_city;
        } else {
          createdOrder.billing_city
        }
      }

      if (shippingDeptResult != null) {
        if (createdOrder.shipping_state && shippingDeptResult.desc_department && createdOrder.shipping_state === shippingDeptResult.desc_department) {
          createdOrder.shipping_city = shippingCity ? shippingCity.desc_city : createdOrder.shipping_city;
        } else {
          createdOrder.shipping_city;
        }
      }
    } else {
      if (billingDeptResult != null) {
        if (createdOrder.billing_state === billingDeptResult.desc_department) {
          createdOrder.billing_city = billingCity ? billingCity.desc_city : createdOrder.billing_city;
        } else {
          if (createdOrder.billing_city === 'BOGOTA (C/MARCA)') {
            createdOrder.billing_city = createdOrder.billing_city; // Mantiene el valor actual
          } else {
            createdOrder.billing_city = 'ERROR';
          }
        }
      }

      if (shippingDeptResult != null) {
        if (createdOrder.shipping_state && shippingDeptResult.desc_department && createdOrder.shipping_state === shippingDeptResult.desc_department) {
          createdOrder.shipping_city = shippingCity ? shippingCity.desc_city : createdOrder.shipping_city;
        } else {
          if (createdOrder.shipping_city === 'BOGOTA (C/MARCA)') {
            createdOrder.shipping_city = createdOrder.shipping_city; // Mantiene el valor actual
          } else {
            createdOrder.shipping_city = 'ERROR';
          }
        }
      }
    }


    if (order.discount_applications && order.discount_applications.length > 0 && (order.discount_applications[0].type === 'automatic' || order.discount_codes[0].code.startsWith('FX'))) {

      if (order.discount_codes.length === 0 || order.discount_codes[0].code.startsWith('FX')) {
        for (const lineItem of order.line_items) {
          const sku = lineItem.sku;

          let desc_aut = parseFloat(lineItem.discount_allocations[0]?.amount) || 0;

          const product = await db.product.findOne({
            where: { sku: sku },
          });

          let valor_dcto = product ? (product.compare_at_price !== null ? product.compare_at_price : 0) : 0;

          let desc = 0;
          let unitario = 0;
          let des_unitario = 0;
          let des_unitario_2 = 0;
          let valor_bruto_resta_descuento = 0;

          if (valor_dcto > 0) {
            desc = parseFloat(((valor_dcto - lineItem.price) * lineItem.quantity) + desc_aut);
            des_unitario = desc / lineItem.quantity;
            des_unitario_2 = parseFloat((valor_dcto - lineItem.price));
            unitario = parseFloat(lineItem.price) + des_unitario_2;
          } else {
            desc = desc_aut;
            des_unitario = desc / lineItem.quantity
            unitario = parseFloat(lineItem.price);
          }

          if (valor_dcto > 0) {
            valor_bruto_resta_descuento = (valor_dcto * lineItem.quantity) - desc;
          } else {
            valor_bruto_resta_descuento = (lineItem.price * lineItem.quantity) - desc;
          }

          const valor_bruto_dividido = valor_bruto_resta_descuento / lineItem.quantity;

          await db.order_items.create({
            order_ref: order.id,
            product_id: lineItem.id.toString(),
            sku: sku,
            order_item_name: lineItem.name,
            pa_sucursal: lineItem.sku.startsWith("H") ? (lineItem.properties[0]?.value || 'Cali-Imbanaco') : '',
            unitario_coniva: (unitario),
            valor_dcto: (des_unitario),
            valor_bruto: (valor_bruto_dividido),
            qty: lineItem.quantity,
            line_total: redondeoPersonalizado(valor_bruto_resta_descuento),
            cupon_hw: 0,
            cupon_ue: 0,
          });
        }
      } else if (order.discount_codes.length > 0 && (!order.discount_codes[0].code.startsWith('FX'))) {
        for (const lineItem of order.line_items) {
          const sku = lineItem.sku;

          let cuponHw1 = 0;
          let cuponUe1 = 0;
          let desc_aut = 0;

          if (lineItem.discount_allocations.length > 1) {
            for (let i = 1; i < lineItem.discount_allocations.length; i++) {
              if (lineItem.sku.startsWith("H")) {
                cuponHw1 += parseFloat(lineItem.discount_allocations[i]?.amount) || 0;
              } else if (lineItem.sku.startsWith("U")) {
                cuponUe1 += parseFloat(lineItem.discount_allocations[i]?.amount) || 0;
              }
            }
            desc_aut = parseFloat(lineItem.discount_allocations[0]?.amount) || 0;
          } else {
            if (lineItem.sku.startsWith("H")) {
              cuponHw1 = parseFloat(lineItem.discount_allocations[0]?.amount) || 0;
            } else if (lineItem.sku.startsWith("U")) {
              cuponUe1 = parseFloat(lineItem.discount_allocations[0]?.amount) || 0;
            }
          }

          const product = await db.product.findOne({
            where: { sku: sku },
          });

          let valor_dcto = product ? (product.compare_at_price !== null ? product.compare_at_price : 0) : 0;

          let desc = 0;
          let unitario = 0;
          let des_unitario = 0;
          let des_unitario_2 = 0;
          let valor_bruto_resta_descuento = 0;

          if (valor_dcto > 0) {
            desc = parseFloat(((valor_dcto - lineItem.price) * lineItem.quantity) + desc_aut);
            des_unitario = desc / lineItem.quantity;
            des_unitario_2 = parseFloat((valor_dcto - lineItem.price));
            unitario = parseFloat(lineItem.price) + des_unitario_2;
          } else if (lineItem.discount_allocations.length > 1) {
            desc = desc_aut;
            des_unitario = desc / lineItem.quantity
            unitario = parseFloat(lineItem.price);
          } else {
            unitario = parseFloat(lineItem.price);
          }

          if (valor_dcto > 0) {
            valor_bruto_resta_descuento = (valor_dcto * lineItem.quantity) - desc;
          } else {
            valor_bruto_resta_descuento = (lineItem.price * lineItem.quantity) - desc;
          }
          const valor_bruto_dividido = valor_bruto_resta_descuento / lineItem.quantity;

          await db.order_items.create({
            order_ref: order.id,
            product_id: lineItem.id.toString(),
            sku: sku,
            order_item_name: lineItem.name,
            pa_sucursal: lineItem.sku.startsWith("H") ? (lineItem.properties[0]?.value || 'Cali-Imbanaco') : '',
            unitario_coniva: (unitario),
            valor_dcto: (des_unitario),
            valor_bruto: (valor_bruto_dividido),
            qty: lineItem.quantity,
            line_total: redondeoPersonalizado(valor_bruto_resta_descuento),
            cupon_hw: parseFloat(lineItem.sku.startsWith("H") ? cuponHw1 : 0),
            cupon_ue: parseFloat(lineItem.sku.startsWith("U") ? cuponUe1 : 0),
          });
        }
      }
    } else {
      for (const lineItem of order.line_items) {

        const cuponHw = parseFloat(lineItem.discount_allocations[0]?.amount) || 0;
        const cuponUe = parseFloat(lineItem.discount_allocations[0]?.amount) || 0;

        const product = await db.product.findOne({
          where: { sku: lineItem.sku },
        });

        const valor_dcto = product ? (product.compare_at_price !== null ? product.compare_at_price : 0) : 0;

        let desc = 0
        let unitario = 0
        let des_unitario = 0

        if (valor_dcto > 0) {
          desc = parseFloat((valor_dcto - lineItem.price) * lineItem.quantity)
          des_unitario = desc / lineItem.quantity
          unitario = parseFloat(lineItem.price) + des_unitario
        } else {
          unitario = parseFloat(lineItem.price)
        }

        await db.order_items.create({
          order_ref: order.id,
          product_id: lineItem.id.toString(),
          sku: lineItem.sku,
          order_item_name: lineItem.name,
          pa_sucursal: lineItem.sku.startsWith("H") ? (lineItem.properties[0]?.value || 'Cali-Imbanaco') : '',
          unitario_coniva: unitario,
          valor_dcto: (des_unitario),
          valor_bruto: parseFloat(lineItem.price),
          qty: lineItem.quantity,
          line_total: ((parseFloat(lineItem.price) * parseFloat(lineItem.quantity))),
          cupon_hw: parseFloat(lineItem.sku.startsWith("H") ? cuponHw : 0),
          cupon_ue: parseFloat(lineItem.sku.startsWith("U") ? cuponUe : 0),
        });
      }
    }

    await createdOrder.save();

    const state = await db.state.findOne({ where: { id: 2 } });

    if (state && state.value === 1) {
      await postToUrl('https://histoweb.co/Laskinweb/shoservice.asmx/sho_Hook');
    } else {
      console.log('SE LA SALTA');
    }

    console.log(`Se creó la órden con éxito.`);

    return { status: 200, message: 'Órden creada con éxito.' };
  } catch (error) {
    console.log('Error creando la órden');
    console.log(error);
    await postToUrl('https://histoweb.co/Laskinweb/shoservice.asmx/sho_Hook');
    return { status: 500, message: 'Error creando la órden.' };
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
    const responseText = await response.text();

    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(responseText);

    const stringValue = result.string._;

    console.log('Respuesta del servidor:', stringValue);

  } catch (error) {
    console.error('Error durante la solicitud POST a la otra URL:', error);
    throw error;
  }
}


async function updateProduct(productData) {
  try {
    const registro = await db.product.update(
      {
        title: productData.title,
        product_type: productData.product_type,
        body_html: productData.body_html,
        vendor: productData.vendor,
        tags: productData.tags,
        status: productData.status,
        published_at: productData.published_at || '',
        inventory_policy: productData.variants[0].inventory_policy,
        inventory_management: productData.variants[0].inventory_management,
        price: productData.variants[0].price,
        compare_at_price: productData.variants[0].compare_at_price,
        inventory_quantity: productData.variants[0].inventory_quantity,
        requires_shipping: productData.variants[0].requires_shipping,
        inventory_item_id: productData.variants[0].inventory_item_id,
        sku: productData.variants[0].sku,
        barcode: productData.variants[0].barcode,
        taxable: productData.variants[0].taxable,
        weight: productData.variants[0].weight
      },
      {
        where: {
          product_id: productData.id
        },
      }
    );

    const newRecord = await db.record.create({
      message: "Actualizado",
      product_type: productData.product_type,
      product_id: productData.id,
      sku: productData.variants[0].sku,
      title: productData.title,
      product_type: productData.product_type,
      body_html: productData.body_html,
      vendor: productData.vendor,
      status: productData.status,
      price: productData.variants[0].price,
      compare_at_price: productData.variants[0].compare_at_price,
      tags: productData.tags,
      inventory_quantity: productData.variants[0].inventory_quantity,
      requires_shipping: productData.variants[0].requires_shipping,
      inventory_management: productData.variants[0].inventory_management,
      inventory_policy: productData.variants[0].inventory_policy,
      type: 2,
      date_act: formatDate(productData.updated_at),
      date_crea: formatDate(productData.created_at)
      //response_status: res.statusCode,
    });

    console.log('Producto actualizado con éxito');
    return { status: 200, message: 'Producto actualizado con exito.' };
  } catch (error) {
    const newRecord = await db.record.create({
      message: "Error en la actualización",
      product_type: productData.product_type,
      product_id: productData.id,
      sku: productData.variants[0].sku,
      title: productData.title,
      product_type: productData.product_type,
      body_html: productData.body_html,
      vendor: productData.vendor,
      status: productData.status,
      price: productData.variants[0].price,
      compare_at_price: productData.variants[0].compare_at_price,
      tags: productData.tags,
      inventory_quantity: productData.variants[0].inventory_quantity,
      requires_shipping: productData.variants[0].requires_shipping,
      inventory_management: productData.variants[0].inventory_management,
      inventory_policy: productData.variants[0].inventory_policy,
      type: 2,
      date_act: formatDate(productData.updated_at),
      date_crea: formatDate(productData.created_at)
      //response_status: res.statusCode,
    });

    console.log('¡Error en el servidor!');
    console.log(error);
    return { status: 500, message: 'Error en el servidor.' };
  }
};

async function updateorder(order) {
  try {
    if (!order || typeof order !== 'object' || Object.keys(order).length === 0) {
      return { status: 400, message: 'Objeto de orden inválido o vacío.' };

    }

    if (!order.line_items || order.line_items.length === 0) {
      return { status: 400, message: 'La orden debe contener al menos un item (order_item).' };

    }

    const existingOrder = await db.order.findOne({
      where: { order_ref: order.id },
    });

    const transaction = await db.transaction.findOne({
      where: {
        order_id: order.id,
      },
      order: [['created_at', 'DESC']],
      limit: 1,
    });

    const paymentId = transaction ? transaction.payment_id : null;


    if (!existingOrder) {
      return { status: 400, message: 'La orden no existe en la base de datos.' };
    }

    await existingOrder.update({
      order_date: formatDate(order.created_at),
      order_modified: formatDate(order.updated_at),
      order_status: order.financial_status === 'paid' ? 'wc-processing' : order.order_status,

      payment_method: order.payment_gateway_names.length > 1
        ? order.payment_gateway_names[1] === 'Wompi' || order.payment_gateway_names[1] === 'bogus'
          ? 'wompi_wwp'
          : order.payment_gateway_names[1] === 'Addi Payment'
            ? 'addi'
            : payment_method
        : order.payment_gateway_names[0] === 'Wompi' || order.payment_gateway_names[0] === 'bogus'
          ? 'wompi_wwp'
          : order.payment_gateway_names[0] === 'Addi Payment'
            ? 'addi'
            : payment_method,

      transaction_id: paymentId || order.confirmation_number,
    });

    await existingOrder.save();
    console.log('Órden actualizada con éxito');
    return { status: 200, message: 'Órden actualizada con éxito' };
  } catch (error) {
    console.error('Error en la función updateOrder:', error);
    return { status: 500, message: 'Error actualizando la órden.' };
  }
};

//GETS
async function productsHW() {
  const url = 'https://histoweb.co/laskinweb.rest/api/productspricelist';
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
              body_html: "",
              product_type: "PRODUCTO",
              vendor: product.product_brand ? product.product_brand.toUpperCase() : "", // Check if product_brand is not null
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
          }).slice(0, 3000);

          return { products: transformedProducts };

        } else {
          console.log('Hola');
        }
      } else {
        console.log('HOLA');
      }
    } else {
      console.log('HOLA');
    }
  } catch (error) {
    console.log('ERROR2');
  }
};



async function products() {
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
      return { products: transformedProducts };
    }
  } catch (error) {
    return { error: 'Error al consultar los productos' };
  }
};




async function proceduresHW() {
  const url = 'https://histoweb.co/laskinweb.rest/api/procedurespricelist';
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
              body_html: "",
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
                  requires_shipping: "false",
                  taxable: taxable,
                  barcode: weight.toString()
                },
              ],
              tags: reSortedTags, // Utilizar los tags ordenados
            };
          })
          .slice(0, 10000);


        return { procedures: transformedProcedures };
      } else {
        return { error: "No hay registros en el sistema." }
      }
    } else {
      return { error: "La respuesta de la API no contiene un array de procedimientos." }
    }
  } catch (error) {
    return { error: "¡Error en el servidor!" }
  }
};



async function procedures() {
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
              inventory_management: null,
              requires_shipping: product.requires_shipping,
              taxable: product.taxable,
              barcode: product.barcode
            },
          ],
        };
      });

      return { procedures: transformedProducts };
    }
  } catch (error) {
    return ('Error al consultar los productos:', error);
  }
};


async function orders() {
  try {
    const orders = await db.order.findAll({
      order: [['order_date', 'DESC']],
      where: {
        state: 0,
        order_status: 'wc-processing',
      },
      include: {
        model: db.order_items
      },
      limit: 1000
    });

    const result = await Promise.all(orders.map(async (order) => {
      const orderData = {
        order_ref: order.order_ref,
        id_shopify: order.id_shopify,
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
        order_shipping: order.order_shipping,
        cupon_code: order.cupon_code,
        branch_description: order.branch_description,
        branch_id: order.branch_id,
        state: order.state,
        shipping_notes: order.shipping_notes,
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
      //orderData.json = JSON.stringify(orderData, null, 2);

      return orderData;
    }));

    return { orders: result };
  } catch (error) {
    console.error('Error:', error);
    //return { status: 500, message: 'Error al recuperar las órdenes' };
    return error('Error al consultar las órdenes:', error);
  }
}



async function modifyOrder(order) {
  try {

    const existingOrder = await db.order.findOne({
      where: { order_ref: order.order_ref },
    });

    if (!existingOrder) {
      return { status: 404, message: 'La orden no existe en la base de datos.' };
    }

    await existingOrder.update({
      code: order.response_code, //codigo order_ref de shopify
      message: order.response_message, //mensaje de error
      state: order.state, //1 o 3
      order_id: order.order_id
    });
    await existingOrder.save();
    console.log('Órden actualizada con éxito');
    return { status: 200, message: 'Órden actualizada con éxito' };
  } catch (error) {
    console.error('Error en la función updateOrder:', error);
    //return { status: 500, message: 'Error actualizando la órden.' };
    return error('Error al actualizar la órden:', error);
  }
};
