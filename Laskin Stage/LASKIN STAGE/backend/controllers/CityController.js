const axios = require('axios');
const db = require('../models');
const getEncryptedText = require('../services/Encrypt');
const plaintext = process.env.TOKEN;
const encryptedText = getEncryptedText(plaintext);
require('dotenv').config();


exports.city = async (req, res, next) => {
  const url = process.env.URL_CITY_HW;
  const headers = {
    'ApiSignature': encryptedText
  };

  try {
    const response = await axios.get(url, { headers });
    const responseBody = response.data.response_body;
    
    await createOrUpdateCities(responseBody);

    let totalCiudades = 0;
    for (const departamento of responseBody) {
      if (departamento.departamentos && departamento.departamentos.length > 0) {
        totalCiudades += departamento.departamentos.reduce((count, ciudad) => count + ciudad.ciudades.length, 0);
      }
    }

    res.status(200).json({ totalCiudades });
  } catch (error) {
    res.status(500).send({
      error: '¡Error en el servidor!'
    });
    next(error);
  }
};


async function createOrUpdateCities(cityData) {
  for (const countryData of cityData) {
    const id_country = countryData.id;
    const desc_country = countryData.description;

    for (const departmentData of countryData.departamentos) {
      const id_department = departmentData.id;
      const desc_department = departmentData.description;

      for (const cityData of departmentData.ciudades) {
        const id_city = cityData.id;
        const desc_city = cityData.description;

        const city = desc_city.substr(0, desc_city.lastIndexOf(' '));

        try {
          const existingCity = await db.city.findOne({ where: { id_city } });

          if (existingCity) {
            await db.city.update(
              {
                id_country,
                desc_country,
                id_department,
                desc_department,
                city, 
              },
              { where: { id_city } }
            );
            //console.log('La ciudad ha sido actualizada:', city);
          } else {
            await db.city.create({
              id_country,
              desc_country,
              id_department,
              desc_department,
              id_city,
              desc_city,
              city, // Agregar el campo "city" con el valor modificado
            });
            //console.log('Ciudad creada con éxito:', city);
          }
        } catch (error) {
          //console.error('Error al ingresar la ciudad en la base de datos:', error);
          throw error;
        }
      }
    }
  }
}


exports.citylist = async (req, res, next) => {
  try {
      const cities = await getCities();
      res.status(200).json(cities);
  } catch (error) {
      if (error.response) {
          const responseCode = error.response.status;
          const responseMessage = error.response.data.response_message;

          res.status(responseCode).send({
              error: responseMessage,
              url: process.env.URL_CITY_HW
          });
      } else {
          res.status(500).send({
              error: 'Error en el servidor.',
              url: process.env.URL_CITY_HW
          });
      }
      next(error);
  }
}


const getCities = async () => {
  const url = process.env.URL_CITY_HW;

  try {
      const response = await axios.get(url, {
          headers: {
              'ApiSignature': encryptedText
          }
      });

      const responseBody = response.data.response_body;

      if (responseBody && Array.isArray(responseBody)) {
          const citiesWithSpaces = [];
          const citiesWithoutSpaces = [];
          const cityIds = []; 

          responseBody.forEach((country) => {
              if (country.departamentos && Array.isArray(country.departamentos)) {
                  country.departamentos.forEach((department) => {
                      if (department.ciudades && Array.isArray(department.ciudades)) {
                          department.ciudades.forEach((city) => {
                              citiesWithSpaces.push(city.description);

                              const cityNameWithoutSpace = city.description.substring(0, city.description.lastIndexOf(' '));
                              citiesWithoutSpaces.push(cityNameWithoutSpace);

                              if (city.id) {
                                  cityIds.push(city.id); 
                              }
                          });
                      }
                  });
              }
          });

          return { citiesWithSpaces, citiesWithoutSpaces, cityIds }; 
      } else {
          return { citiesWithSpaces: [], citiesWithoutSpaces: [], cityIds: [] };
      }
  } catch (error) {
      throw error;
  }
}


exports.cities = async (req, res, next) => {
  const city = db.c_city;
  try {
    const cities = await city.findAll({});

    if (!cities || cities.length === 0) {
      res.send({
        error: 'No hay registros en el sistema.',
      });
    } else {
      const transformedCities = cities.map((cities) => {
        return {
          city: cities.desc_city,
          c_city: cities.city
        };
      });

      const response = { cities: transformedCities };
      res.status(200).json(response);
    }
  } catch (error) {
    console.error('Error al consultar los productos:', error);
  }
};

exports.departments = async (req, res, next) => {
  const city = db.c_city;
  try {
    const departments = await city.findAll({});

    if (!departments || departments.length === 0) {
      res.send({
        error: 'No hay registros en el sistema.',
      });
    } else {
      // Utilizar un conjunto para eliminar duplicados
      const uniqueDepartmentsSet = new Set(departments.map(department => department.desc_department));

      // Convertir el conjunto de nuevo a un array
      const uniqueDepartmentsArray = Array.from(uniqueDepartmentsSet);

      const transformedDepartments = uniqueDepartmentsArray.map(department => {
        return {
          department: department,
        };
      });

      const response = { departments: transformedDepartments };
      res.status(200).json(response);
    }
  } catch (error) {
    console.error('Error al consultar los productos:', error);
  }
};

exports.list = async (req, res, next) => {
  try {
    console.log("Iniciando consulta de ciudades por departamento...");
    const departmentsWithCities = await db.c_city.findAll({
      attributes: ['desc_department', 'desc_city'],
      raw: true // Para obtener resultados como objetos de JavaScript puros
    });

    console.log("Consulta exitosa. Enviando respuesta...");
    if (departmentsWithCities.length !== 0) {
      // Organizar las ciudades por departamento
      const citiesByDepartment = {};
      departmentsWithCities.forEach(city => {
        const department = city.desc_department;
        const cityName = city.desc_city; // Extraer el nombre de la ciudad
        const cityData = { desc_city: city.desc_city, city: cityName };
        if (!citiesByDepartment[department]) {
          citiesByDepartment[department] = [cityData];
        } else {
          citiesByDepartment[department].push(cityData);
        }
      });
      
      res.status(200).json(citiesByDepartment);
    } else {
      console.log("No se encontraron registros en el sistema.");
      res.status(404).send({
        error: 'No hay registros en el sistema.'
      });
    }
  } catch (err) {
    console.error("Error en el servidor:", err);
    return res.status(500).json({ error: '¡Error en el servidor!' });
  }
};





