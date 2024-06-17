const axios = require('axios');
require('dotenv').config();
const db = require('../models');
const getEncryptedText = require('../services/Encrypt');
const plaintext = process.env.TOKEN;
const encryptedText = getEncryptedText(plaintext);

  exports.datehw = async (req, res, next) => {
  const url = process.env.URL_DATE;
  const plaintext = process.env.TOKEN;
  const encryptedText = getEncryptedText(plaintext);

  try {

    const response = await axios.get(url, {
      headers: {
        'ApiSignature': encryptedText
      }
    });
    const responseData = response.data;

    res.status(200).json({ date: responseData });
  } catch (error) {
    res.status(500).send({
      error: '¡Error en el servidor!'
    });
    next(error);
  }
}; 

/*   exports.datehw = async (req, res, next) => {
  try {
    const responseData = {
      is_processing: false,
      has_errors: false,
      pending_update: false,
      updated_on: "2023.04.04 15:43:09"
    };
    res.status(200).json({ date: responseData });
  } catch (error) {
    res.status(500).send({
      error: '¡Error en el servidor!'
    });
    next(error);
  }
};  */

exports.createDate = async (req, res, next) => {
  try {
    const date = req.body;

    if (!date) {
      return res.status(400).send({
        error: 'Objeto de fecha inválido o vacío.',
      });
    }

    const createdDate = await db.date.create({
      date_hw: req.body.fechaUpdatedOn, // Esto debe ser req.body.fechaUpdatedOn
      date_rabbit: req.body.fechaActual, // Esto debe ser req.body.fechaActual
      state: req.body.estado,
      responsible: req.body.responsible,
      qty: req.body.qty
    });

    res.status(200).send({
      message: `Se creó el registro con éxito.`,
      createdDate,
    });
  } catch (error) {
    res.status(500).send({
      error: '¡Error en el servidor!',
    });
    next(error);
  }
};

exports.createStockDate = async (req, res, next) => {
  try {
    const date = req.body;

    if (!date) {
      return res.status(400).send({
        error: 'Objeto de fecha inválido o vacío.',
      });
    }

    const createdStockDate = await db.stock_dates.create({
      action: req.body.action, // Esto debe ser req.body.fechaUpdatedOn
      responsible: req.body.responsible, // Esto debe ser req.body.fechaActual
      date: req.body.date,
    });

    res.status(200).send({
      message: `Se creó el registro con éxito.`,
      createdStockDate,
    });
  } catch (error) {
    res.status(500).send({
      error: '¡Error en el servidor!',
    });
    next(error);
  }
};

exports.listLastProductDate = async (req, res, next) => {
  try {
    const lastProductDate = await db.date.findOne({
      where: {
        state: 'PRODUCTO',
        responsible: {
          [db.Sequelize.Op.not]: 'AUTOMATICO'
        }
      },
      order: [['date_rabbit', 'DESC']]
    });

    if (!lastProductDate) {
      return res.status(404).send({
        message: 'No se encontraron registros con estado "PRODUCTO".'
      });
    }

    res.status(200).send({
      message: 'Último registro con estado "PRODUCTO" encontrado exitosamente.',
      lastProductDate
    });
  } catch (error) {
    res.status(500).send({
      error: '¡Error en el servidor!'
    });
    next(error);
  }
};

exports.listLastProcedureDate = async (req, res, next) => {
  try {
    const lastProcedureDate = await db.date.findOne({
      where: {
        state: 'PROCEDIMIENTO',
        responsible: {
          [db.Sequelize.Op.not]: 'AUTOMATICO'
        }
      },
      order: [['date_rabbit', 'DESC']]
    });

    if (!lastProcedureDate) {
      return res.status(404).send({
        message: 'No se encontraron registros con estado "PROCEDIMIENTO".'
      });
    }

    res.status(200).send({
      message: 'Último registro con estado "PROCEDIMIENTO" encontrado exitosamente.',
      lastProcedureDate
    });
  } catch (error) {
    res.status(500).send({
      error: '¡Error en el servidor!'
    });
    next(error);
  }
};


exports.listLastActivationDate = async (req, res, next) => {
  try {
    const lastActivationDate = await db.stock_dates.findOne({
      where: {
        action: 'ACTIVATION'
      },
      order: [['date', 'DESC']]
    });

    if (!lastActivationDate) {
      return res.status(404).send({
        message: 'No se encontraron registros con ACTIVATION.'
      });
    }

    res.status(200).send({
      message: 'Último registro con ACTIVATION encontrado exitosamente.',
      lastActivationDate
    });
  } catch (error) {
    res.status(500).send({
      error: '¡Error en el servidor!'
    });
    next(error);
  }
};



exports.listLastDesactivationDate = async (req, res, next) => {
  try {
    const lastActivationDate = await db.stock_dates.findOne({
      where: {
        action: 'DESACTIVATION'
      },
      order: [['date', 'DESC']]
    });

    if (!lastActivationDate) {
      return res.status(404).send({
        message: 'No se encontraron registros con DESACTIVATION.'
      });
    }

    res.status(200).send({
      message: 'Último registro con DESACTIVATION encontrado exitosamente.',
      lastActivationDate
    });
  } catch (error) {
    res.status(500).send({
      error: '¡Error en el servidor!'
    });
    next(error);
  }
};


exports.automaticDateProduct = async (req, res, next) => {
  try {
    const automaticDate = await db.date.findOne({
      where: {
        state: 'PRODUCTO_AUTO',
        responsible: 'AUTOMATICO'
      },
      order: [['date_rabbit', 'DESC']]
    });

    if (!automaticDate) {
      return res.status(404).send({
        message: 'No se encontraron registros AUTOMATICOS de productos.'
      });
    }

    res.status(200).send({
      message: 'Última fecha automática de producto encontrada exitosamente.',
      automaticDate
    });
  } catch (error) {
    res.status(500).send({
      error: '¡Error en el servidor!'
    });
    next(error);
  }
};

exports.automaticDateProcedure = async (req, res, next) => {
  try {
    const automaticDate = await db.date.findOne({
      where: {
        state: 'PROCEDIMIENTO_AUTO',
        responsible: 'AUTOMATICO'
      },
      order: [['date_rabbit', 'DESC']]
    });

    if (!automaticDate) {
      return res.status(404).send({
        message: 'No se encontraron registros AUTOMATICOS de procedimiento.'
      });
    }

    res.status(200).send({
      message: 'Última fecha automática de procedimiento encontrada exitosamente.',
      automaticDate
    });
  } catch (error) {
    res.status(500).send({
      error: '¡Error en el servidor!'
    });
    next(error);
  }
};
