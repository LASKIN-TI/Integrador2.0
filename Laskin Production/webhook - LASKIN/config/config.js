module.exports = {
    "development": {
        "username": process.env.DB_DEV_USER,
        "password": process.env.DB_DEV_PASSWORD,
        "database": process.env.DB_DEV_NAME,
        "host": process.env.DB_DEV_HOST,
        "dialect": process.env.DB_DEV_DIALECT,
        "logging": false
    }
}
