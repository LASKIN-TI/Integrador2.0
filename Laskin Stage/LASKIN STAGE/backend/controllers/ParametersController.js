const db = require('../models');
const cron = require('node-cron');
const axios = require('axios');
const { Op } = require('sequelize'); // Importar Op desde Sequelize

let cronTask = null;
let cronTask2 = null;

exports.ParameterStock = async (req, res, next) => {
  try {
    const stock = await db.parameter.findOne({
      where: {
        id: 1
      },
    });

    if (!stock) {
      return res.status(404).send({
        message: 'No se encontró un valor para el stock.'
      });
    }

    res.status(200).send({
      message: 'Se encontró el valor para el stock',
      stock
    });
  } catch (error) {
    res.status(500).send({
      error: '¡Error en el servidor!'
    });
    next(error);
  }
};

exports.activeMessage = async (req, res, next) => {
  try {
    const active = await db.parameter.findOne({
      where: {
        id: 4
      },
    });

    if (!active) {
      return res.status(404).send({
        message: 'No se encontró un valor para la activación de mensajes.'
      });
    }

    res.status(200).send({
      message: 'Se encontró el valor para la activación de mensajes',
      active
    });
  } catch (error) {
    res.status(500).send({
      error: '¡Error en el servidor!'
    });
    next(error);
  }
};

exports.sedeDefecto = async (req, res, next) => {
  try {
    const sede = await db.parameter.findOne({
      where: {
        id: 3
      },
    });

    if (!sede) {
      return res.status(404).send({
        message: 'No se encontró un valor para la sede.'
      });
    }

    res.status(200).send({
      message: 'Se encontró el valor para la sede',
      sede
    });
  } catch (error) {
    res.status(500).send({
      error: '¡Error en el servidor!'
    });
    next(error);
  }
};

exports.credentialsGoogle = async (req, res, next) => {
  try {
    const credential = await db.parameter.findOne({
      where: {
        id: 2
      },
    });

    if (!credential) {
      return res.status(404).send({
        message: 'No se encontró un valor para la api.'
      });
    }

    res.status(200).send({
      message: 'Se encontró el valor para la api',
      credential
    });
  } catch (error) {
    res.status(500).send({
      error: '¡Error en el servidor!'
    });
    next(error);
  }
};


exports.updateGoogleCredentials = async (req, res, next) => {
  try {
    // Buscar la primera fila en la tabla credencial con id igual a 1
    const credential = await db.parameter.findOne({ where: { id: 1 } });

    if (credential) {
      // Si se encontró la fila, actualiza el valor de token
      await db.parameter.update(
        { token: req.body.token },
        { where: { id: 2 } } // Actualizar solo la fila con id igual a 1
      );

      res.json({ success: 'Credenciales actualizadas con éxito' });
    } else {
      // Manejar el caso si no se encontró ninguna fila (esto no debería ocurrir en condiciones normales)
      console.error('No se encontró campo de token');
      res.status(500).json({ error: 'No se encontró campo de token' });
    }
  } catch (error) {
    console.error('Error al actualizar el token de credenciales:', error);
    res.status(500).json({ error: 'Error al actualizar las credenciales' });
  }
};

exports.updateStock = async (req, res, next) => {
  try {
    // Buscar la primera fila en la tabla credencial con id igual a 1
    const stock = await db.parameter.findOne({ where: { id: 1 } });

    if (stock) {
      // Si se encontró la fila, actualiza el valor de token
      await db.parameter.update(
        { value: req.body.value },
        { where: { id: 1 } } // Actualizar solo la fila con id igual a 1
      );

      res.json({ success: 'Stock actualizado con éxito' });
    } else {
      // Manejar el caso si no se encontró ninguna fila (esto no debería ocurrir en condiciones normales)
      console.error('No se encontró campo de value');
      res.status(500).json({ error: 'No se encontró campo de value' });
    }
  } catch (error) {
    console.error('Error al actualizar el value del stock:', error);
    res.status(500).json({ error: 'Error al actualizar el stock' });
  }
};

exports.updateSede = async (req, res, next) => {
  try {
    // Buscar la primera fila en la tabla credencial con id igual a 1
    const sede = await db.parameter.findOne({ where: { id: 3 } });

    if (sede) {
      // Si se encontró la fila, actualiza el valor de token
      await db.parameter.update(
        { 
          token: req.body.token,
          value: req.body.value
         },
        { where: { id: 3 } } // Actualizar solo la fila con id igual a 1
      );

      res.json({ success: 'sede actualizado con éxito' });
    } else {
      // Manejar el caso si no se encontró ninguna fila (esto no debería ocurrir en condiciones normales)
      console.error('No se encontró campo de value');
      res.status(500).json({ error: 'No se encontró campo de value' });
    }
  } catch (error) {
    console.error('Error al actualizar el value del sede:', error);
    res.status(500).json({ error: 'Error al actualizar el sede' });
  }
};

exports.updateActive = async (req, res, next) => {
  try {

    // Buscar la primera fila en la tabla credencial con id igual a 1
    const active = await db.parameter.findOne({ where: { id: 3 } });

    if (active) {
      // Si se encontró la fila, actualiza el valor de token
      await db.parameter.update(
        { value: req.body.active },
        { where: { id: 4 } } // Actualizar solo la fila con id igual a 1
      );

      res.json({ success: 'Estado actualizado con éxito' });


    } else {
      // Manejar el caso si no se encontró ninguna fila (esto no debería ocurrir en condiciones normales)
      console.error('No se encontró campo de value');
      res.status(500).json({ error: 'No se encontró campo de estado' });
    }
  } catch (error) {
    console.error('Error al actualizar el estado:', error);
    res.status(500).json({ error: 'Error al actualizar el estado' });
  }
};

exports.parameterMessages = async (req, res, next) => {
  try {
    const parameterMessages = await db.message.findOne({
      where: {
        id: 1
      },
    });

    if (!parameterMessages) {
      return res.status(404).send({
        message: 'No se encontró un valor para los mensajes.'
      });
    }

    res.status(200).send({
      message: 'Se encontró un valor para los mensajes',
      parameterMessages
    });
  } catch (error) {
    res.status(500).send({
      error: '¡Error en el servidor!'
    });
    next(error);
  }
};

exports.updateParameterMessages = async (req, res, next) => {
  try {

    await cronTask.stop();
    await cronTask2.stop();

    const message = await db.message.findOne({ where: { id: 1 } });

    if (message) {
      // Si se encontró la fila, actualiza el valor de token
      await db.message.update(
        {
          url: req.body.url,
          token: req.body.token,
          time_noti: req.body.time_noti,
          start_laboral: req.body.start_laboral,
          end_laboral: req.body.end_laboral,
          tel_responsable: req.body.tel_responsable,
          template_name: req.body.template_name,
          template_nuevos: req.body.template_nuevos
        },
        { where: { id: 1 } }
      );

      res.json({ success: 'Valores de mensajes actualizados con éxito' });

      await executeCronTask();
      await executeCronTask2();

    } else {
      // Manejar el caso si no se encontró ninguna fila (esto no debería ocurrir en condiciones normales)
      console.error('No se encontró el id para los mensajes');
      res.status(500).json({ error: 'No se encontraron los campos' });
    }
  } catch (error) {
    console.error('Error al actualizar los valores de los mensajes:', error);
    res.status(500).json({ error: 'Error al actualizar los valores de los mensajes' });
  }
};

exports.activeSync = async (req, res, next) => {
  try {
    const active = await db.state.findAll({
      where: {
        [Op.or]: [
          { id: 1 },
          { id: 2 }
        ]
      }
    });

    if (active.length === 0) {
      return res.status(404).send({
        message: 'No se encontraron valores para la sincronización.'
      });
    }

    res.status(200).send({
      message: 'Se encontraron los valores para la sincronización',
      active
    });
  } catch (error) {
    res.status(500).send({
      error: '¡Error en el servidor!'
    });
    next(error);
  }
};


exports.updateSync = async (req, res, next) => {
  try {
    const { active_hook, active_sync } = req.body;

    // Convertir true/false a 1/0
    const activeHookValue = active_hook ? 1 : 0;
    const activeSyncValue = active_sync ? 1 : 0;

    const activeHookRecord = await db.state.findOne({ where: { id: 2 } });
    const activeSyncRecord = await db.state.findOne({ where: { id: 1 } });

    if (activeHookRecord && activeSyncRecord) {
      // Actualizar el valor de active_hook
      await db.state.update(
        { value: activeHookValue },
        { where: { id: 2 } }
      );

      // Actualizar el valor de active_sync
      await db.state.update(
        { value: activeSyncValue },
        { where: { id: 1 } }
      );

      res.json({ success: 'Valores de sincronización actualizados con éxito' });
    } else {
      console.error('No se encontraron los ids para los mensajes');
      res.status(500).json({ error: 'No se encontraron los campos' });
    }
  } catch (error) {
    console.error('Error al actualizar los valores de los mensajes:', error);
    res.status(500).json({ error: 'Error al actualizar los valores de los mensajes' });
  }
};


//MENSAJES
async function sendMessage() {
  const { url, token, tel_responsable, template_name } = await getParamsFromParameters();

  try {
    const body = JSON.stringify({
      "connector_id": "702",
      "telephone": tel_responsable,
      "template_name": template_name,
      "template_vars": "",
      "customer_id": "10203040",
      "url_attach": ""
    });

    const response = await axios.post(url, body, {
      headers: {
        'Content-Type': 'application/json',
        'wolkvox-token': token,
      }
    });

    if (response.status === 201) {
      console.log('MENSAJE ENVIADO');
    } else {
      console.log('ERROR EN LA API');
    }

  } catch (error) {
    console.error('An error occurred:', error);
  }
};

async function getParamsFromParameters() {
  const parameter = await db.message.findOne({ where: { id: 'id', id: 1 } });
  return parameter;
}

async function executeCronTask() {
  try {
    const { time_noti } = await getParamsFromParameters();
    const parameter = await db.parameter.findOne({ where: { id: 4 } });

    let cronTime;
    if (time_noti > 59) {
      // Dividir el tiempo en horas y minutos
      const hours = Math.floor(time_noti / 60);
      const minutes = time_noti % 60;

      // Crear el formato de tiempo cron
      cronTime = `${minutes} */${hours} * * *`;
    } else {
      // Crear el formato de tiempo cron solo con minutos
      cronTime = `*/${time_noti} * * * *`;
    }
    if (parameter && parameter.value === 1) {

      cronTask = cron.schedule(cronTime, async () => {
        const { start_laboral, end_laboral } = await getParamsFromParameters();
        const nowUTC = new Date();
        const nowColombia = new Date(nowUTC.getTime() - (5 * 60 * 60 * 1000));
        const hour = nowColombia.getUTCHours();
        // Verificar si la hora actual está dentro del rango de horario
        if (hour >= start_laboral && hour < end_laboral) {
          const orders = await db.order.findAll({
            where: {
              state: 3,
            }
          });

          if (orders.length > 0) {
            console.log('Hay pedidos atrapados');
            await sendMessage();
          } else {
            console.log('No hay pedidos atrapados');
          }
        } else {
          console.log('Se encuentra fuera del horario laboral');
        }
      });
    }  else {
      console.log('PAILA DE LA DE PEDIDOS ATRAPADOS');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

async function executeCronTask2() {
  try {
    const { time_noti } = await getParamsFromParameters();

    const parameter = await db.parameter.findOne({ where: { id: 4 } });

    let cronTime;
    if (time_noti > 59) {
      // Dividir el tiempo en horas y minutos
      const hours = Math.floor(time_noti / 60);
      const minutes = time_noti % 60;

      // Crear el formato de tiempo cron
      cronTime = `${minutes} */${hours} * * *`;
    } else {
      // Crear el formato de tiempo cron solo con minutos
      cronTime = `*/${time_noti} * * * *`;
    }

    if (parameter && parameter.value === 1) {

      cronTask2 = cron.schedule(cronTime, async () => {
        //const { start_laboral, end_laboral } = await getParamsFromParameters2();
        const nowUTC = new Date();
        const nowColombia = new Date(nowUTC.getTime() - (5 * 60 * 60 * 1000));
        const hour = nowColombia.getUTCHours();
        // Verificar si la hora actual está dentro del rango de horario
        const orders = await db.order.findAll({
          where: {
            status_hook: 0,
          }
        });

        // Objeto para almacenar las órdenes agrupadas por ubicación
        const ordersByLocation = {};

        // Iterar sobre las órdenes y agruparlas por ubicación
        orders.forEach(order => {
          const { location } = order;
          if (!ordersByLocation[location]) {
            ordersByLocation[location] = [];
          }
          ordersByLocation[location].push(order);
        });

        // Procesar los grupos de órdenes por ubicación
        for (const location in ordersByLocation) {
          if (ordersByLocation.hasOwnProperty(location)) {
            let locationName = location;
            // Verificar si el nombre de la ubicación contiene un guion
            if (location.includes('-')) {
              // Dividir el nombre de la ubicación usando el guion como separador y tomar solo la primera parte
              locationName = location.split('-')[0].trim();
            }
            const orders = ordersByLocation[location];

            // Consultar la tabla de locations para obtener tel_sede
            const locationData = await db.location.findOne({
              where: {
                name: locationName
              }
            });

            if (locationData) {
              const telSede = locationData.tel_sede;
              const startLaboral = locationData.start_laboral;
              const endLaboral = locationData.end_laboral
              // Verificar si hay al menos una orden en este grupo
              if (orders.length > 0 && hour >= startLaboral && hour < endLaboral) {
                // Llamar a sendMessage con telSede y location
                await sendMessage2(telSede, location);
                console.log(`Mensaje enviado para ${location} a ${telSede}`);

                // Actualizar el valor de status_hook a 1 para todas las órdenes en este grupo
                await db.order.update(
                  { status_hook: 1 },
                  {
                    where: {
                      location,
                      status_hook: 0
                    }
                  }
                );

                console.log(`Estado de las ordenes actualizado para ${location}`);
              } else {
                //console.log(No hay nuevas ordenes en ${location});
                console.log('Se encuentra fuera del horario laboral');
              }
            } else {
              console.log(`No se encontró información para ${location} en la tabla locations.`);
            }
          }
        }
      });
    }
    else {
      console.log('PAILA DE LA DE PEDIDOS NUEVOS');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}


async function sendMessage2(telSede, location) {
  const { url, token, template_nuevos } = await getParamsFromParameters();

  try {
    const body = JSON.stringify({
      "connector_id": "702",
      "telephone": telSede, // Usamos telSede como el número de teléfono
      "template_name": template_nuevos,
      "template_vars": location, // Usamos location como el valor de template_vars
      "customer_id": "10203040",
      "url_attach": ""
    });

    const response = await axios.post(url, body, {
      headers: {
        'Content-Type': 'application/json',
        'wolkvox-token': token,
      }
    });

    if (response.status === 201) { // Verificamos el estado de la respuesta
      console.log('MENSAJE ENVIADO');
      console.log(response.data.msg); // Accedemos a la propiedad data de la respuesta
    } else {
      console.log('ERROR EN LA API');
      console.log(response.data.error); // Accedemos a la propiedad data de la respuesta
    }

  } catch (error) {
    console.error('An error occurred:', error);
  }
};

(async () => {
  await executeCronTask2();
  await executeCronTask();
})();