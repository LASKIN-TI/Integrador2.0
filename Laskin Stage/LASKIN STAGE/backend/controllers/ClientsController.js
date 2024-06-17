const db = require('../models');

exports.list = async (req, res, next) => {
    try {
        const clients = await db.client.findAndCountAll()
        if (clients.count != 0) {
            res.status(200).json(clients);
        } else {
            res.status(404).send({
                error: 'No hay registros en el sistema.'
            });
        }
    } catch (err) {
        console.error("Error:", err);
        return res.status(500).json({ error: '¡Error en el servidor!' });

    }
};


exports.detail = async (req, res, next) => {
    const { id } = req.query;
    try {
        const oneclient = await db.client.findAndCountAll({
            where: { id: id },
        });
        if (oneclient.count != 0) {
            res.status(200).json(oneclient);
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