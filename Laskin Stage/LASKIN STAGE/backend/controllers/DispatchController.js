const db = require('../models');

exports.create = async (req, res, next) => {
    try {
        // Remover texto entre paréntesis de city
        const cleanedCity = req.body.city.replace(/\s*\(.*?\)\s*/g, '');

        // Verificar si geolocation es true y location no está vacío
        if (req.body.geolocation && req.body.location !== '') {
            return res.status(400).send({
                error: 'No se puede geolocalizar y asignar sede a la vez'
            });
        }

        const Dispatch = await db.dispatch.create({
            country: req.body.country,
            department: req.body.department,
            city: req.body.city,
            des_city: cleanedCity, // Guardar city sin texto entre paréntesis
            geolocation: req.body.geolocation,
            location: req.body.location,
            id_sucursal: req.body.id_sucursal,
            id_bodega: req.body.id_bodega,
            location_default: req.body.location_default,
            id_sucursal_default: req.body.id_sucursal_default,
            id_bodega_default: req.body.id_bodega_default,
            lat: req.body.latitude,
            lng: req.body.longitude
        });

        res.status(200).send({
            message: 'Parámetro creado con éxito.'
        });
    } catch (error) {
        res.status(500).send({
            error: '¡Error en el servidor!'
        });
        next(error);
    }
};



exports.list = async (req, res, next) => {
    try {
        const page = req.query.page;
        const pageSize = 100;

        const country = req.query.country;
        const department = req.query.department;
        const des_city = req.query.des_city;
        const location = req.query.location;

        const whereCondition = {};

        if (country) {
            whereCondition.country = country;
        }

        if (department) {
            whereCondition.department = department;
        }

        if (des_city) {
            whereCondition.des_city = des_city;
        }

        if (location) {
            whereCondition.location = location;
        }

        const result = await db.dispatch.findAndCountAll({
            where: whereCondition,
            limit: pageSize,
            offset: (page - 1) * pageSize
        });

        const totalDispatches = result.count;
        const totalPages = Math.ceil(totalDispatches / pageSize);

        const dispatches = result.rows.map((dispatch) => {
            return {
                id: dispatch.id,
                country: dispatch.country,
                department: dispatch.department,
                city: dispatch.city,
                geolocation: dispatch.geolocation,
                location: dispatch.location,
                des_city: dispatch.des_city,
                id_sucursal: dispatch.id_sucursal,
                location_default: dispatch.location_default,
                lat: dispatch.lat,
                lng: dispatch.lng
            };
        });

        res.status(200).json({
            dispatches: dispatches,
            totalPages: totalPages,
        });

    } catch (err) {
        return res.status(500).json({ error: '¡Error en el servidor!' });

    }
};


exports.delete = async (req, res, next) => {
    const { id } = req.body;
    try {
        const dispatch = await db.dispatch.findOne({
            where: { id: id },
        });
        if (dispatch) {
            await dispatch.destroy();
            res.status(200).send({
                message: 'Parametrización eliminada exitosamente.'
            });
        } else {
            res.status(404).send({
                error: 'La parametrización no fue encontrada.'
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({
            error: '¡Error en el servidor!'
        });
        next(error);
    }
};

exports.detail = async (req, res, next) => {
    const { id } = req.query;
    try {
        const oneDispatch = await db.dispatch.findAndCountAll({
            where: { id: id },
        });
        if (oneDispatch.count != 0) {
            res.status(200).json(oneDispatch);
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

exports.update = async (req, res, next) => {
    try {
        const city = req.body.city || '';
        const cleanedCity = city.replace(/\s*\(.*?\)\s*/g, '');

         // Verificar si geolocation es true y location no está vacío
         if (req.body.geolocation && req.body.location !== '') {
            return res.status(400).send({
                error: 'No se puede geolocalizar y asignar sede a la vez'
            });
        }
        
        const registro = await db.dispatch.update({

            country: req.body.country,
            department: req.body.department,
            city: req.body.city,
            des_city: cleanedCity,
            geolocation: req.body.geolocation,
            location: req.body.location,
            id_sucursal: req.body.id_sucursal,
            id_bodega: req.body.id_bodega,
            location_default: req.body.location_default,
            id_sucursal_default: req.body.id_sucursal_default,
            id_bodega_default: req.body.id_bodega_default,
            lat: req.body.latitude,
            lng: req.body.longitude
        },
            {
                where: {
                    id: req.body.id
                },
            });
        res.status(200).send({
            message: 'Parámetro modificado con éxito.'
        });
    } catch (error) {
        res.status(500).send({
            error: '¡Error en el servidor!'
        });
        next(error);
    }
};


