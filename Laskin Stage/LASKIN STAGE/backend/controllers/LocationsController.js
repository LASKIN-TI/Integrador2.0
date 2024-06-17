const axios = require('axios');
const db = require('../models/index.js');
const cron = require('node-cron');
require('dotenv').config();
const getEncryptedText = require('../services/Encrypt.js');
const plaintext = process.env.TOKEN;
const encryptedText = getEncryptedText(plaintext);

exports.list = async (req, res, next) => {

  try {
    const location = await db.location.findAndCountAll()
    if (location.count != 0) {
      res.status(200).json(location);
    } else {
      res.status(404).send({
        error: 'No hay registros en el sistema.'
      });
    }
  } catch (err) {
    return res.status(500).json({ error: '¡Error en el servidor!' });

  }
};

async function saveLocation() {
  const url = process.env.URL_LOCATIONS;
  const plaintext = process.env.TOKEN;
  const encryptedText = getEncryptedText(plaintext);

  try {
    const response = await axios.get(url, {
      headers: {
        'ApiSignature': encryptedText
      }
    });
    const responseBody = response.data.response_body;

    for (const locationData of responseBody) {
      // Buscar si existe una ubicación con el branch_id correspondiente
      const existingLocation = await db.location.findOne({ where: { id_sucursal: locationData.branch_id } });

      if (existingLocation) {
        // Si existe, actualizar los campos warehouse_id y name
        await existingLocation.update({
          location_id_reference: locationData.warehouse_id,
          name: locationData.branch_description,
        });
        console.log(locationData.branch_description);
        console.log(`Ubicación actualizada para branch_id ${locationData.branch_id}`);
      } else {
        // Si no existe, crear un nuevo registro
        const newLocation = await db.location.create({
          id_sucursal: locationData.branch_id,
          location_id_reference: locationData.warehouse_id,
          name: locationData.branch_description,
          template_name: 'cantidad_pedidos_tienda',
          active: 0,
          default: 0,
          no_stock: 0,
          latitude: 'Sin asignar',
          longitude: 'Sin asignar',
          start_laboral: 0,
          end_laboral: 0,
          tel_sede: 'Sin asignar'
        });
        console.log(`Nueva ubicación creada para branch_id ${locationData.branch_id}: ${newLocation}`);
      }
    }

  } catch (error) {
    console.error('¡Error en el servidor!', error);
  }
}

exports.create = async (req, res, next) => {
  try {
    const Location = await db.location.create({
      name: req.body.name,
      active: req.body.active,
      id_sucursal: req.body.id_sucursal,
      location_id_reference: req.body.location_id_reference,
      default: req.body.default,
      no_stock: req.body.no_stock,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      start_laboral: req.body.start_laboral,
      end_laboral: req.body.end_laboral,
      tel_sede: req.body.tel_sede,
      template_name: req.body.template_name,
      state: req.body.department,
      city: req.body.city
    });

    res.status(200).send({
      message: 'Sede creada con éxito.'
    });
  } catch (error) {
    res.status(500).send({
      error: '¡Error en el servidor!'
    });
    next(error);
  }
};

exports.detail = async (req, res, next) => {
  const { id } = req.query;
  try {
    const onelocation = await db.location.findAndCountAll({
      where: { id: id },
    });
    if (onelocation.count != 0) {
      res.status(200).json(onelocation);
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
    const { id, active, default: newDefault, no_stock: newNoStock } = req.body;

    // Validar datos
    if (id === undefined || active === undefined || newDefault === undefined || newNoStock === undefined) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    // Verificar si la ubicación existe antes de intentar actualizarla
    const location = await db.location.findOne({ where: { id } });
    if (!location) {
      return res.status(404).json({ error: 'No se encontró ninguna sede con ese id' });
    }

    // Verificar si se está intentando establecer esta ubicación como predeterminada,
    // y si ya hay otra ubicación predeterminada en la base de datos
    if (newDefault && (await db.location.count({ where: { default: true } })) > 0) {
      return res.status(400).json({ error: 'Ya hay una sede predeterminada' });
    }

    // Actualizar la ubicación
    await db.location.update(
      { active, default: newDefault, no_stock: newNoStock },
      { where: { id } }
    );

    res.status(200).json({ success: 'Campos actualizados con éxito' });
  } catch (error) {
    console.error('Error al actualizar los campos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.update = async (req, res, next) => {
  try {
    const registro = await db.location.update({
      name: req.body.name,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      start_laboral: req.body.start_laboral,
      end_laboral: req.body.end_laboral,
      tel_sede: req.body.tel_sede,
      template_name: req.body.template_name,
      location_id_reference: req.body.location_id_reference,
      id_sucursal: req.body.id_sucursal,
      state: req.body.department,
      city: req.body.city
    },
      {
        where: {
          id: req.body.id
        },
      });
    res.status(200).send({
      message: 'Sede modificada con éxito.'
    });
  } catch (error) {
    res.status(500).send({
      error: '¡Error en el servidor!'
    });
    next(error);
  }
};

exports.saveLocations = async (req, res, next) => {
  try {
    saveLocation();
    res.status(200).send({
      message: '¡Proceso iniciado!'
    });
  } catch (error) {
    res.status(500).send({
      error: '¡Error en el servidor!'
    });
    next(error);
  }
}