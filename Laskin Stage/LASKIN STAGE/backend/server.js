const express = require('express');
const apiRouter = require('./routes/api');
const swaggerUi = require('swagger-ui-express')
const swaggerSpec  = require('./config/swagger')
const customCSS  = require('./config/swagger')
const bodyParser = require('body-parser');
const cors = require('cors');
const basicAuth = require('express-basic-auth');


//Vars
let PORT;
process.env.NODE_ENV === 'production'
    ? (PORT = process.env.PROD_PORT) :
    process.env.NODE_ENV === 'test'
        ? (PORT = process.env.QA_PORT) :
        (PORT = process.env.DEV_PORT);

//instancia de express en app
const app = express();
app.use(cors());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Access-Control-Allow-Methods: GET, POST, DELETE, PUT');
    next();
});

if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Private-Network: true');
        next();
    });
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//routes
app.use('/', apiRouter);


const users = {};
users[process.env.USUARIO_SWAGGER] = process.env.PASSWORD_SWAGGER;

//Docs
app.use('/docs', basicAuth({
    users: users,
    challenge: true,
    unauthorizedResponse: (req) => {
        return req.auth
            ? ('Credenciales ' + req.auth.user + ':' + req.auth.password + ' son incorrectas.')
            : 'No se proporcionaron credenciales.';
    }
}), swaggerUi.serve, swaggerUi.setup(swaggerSpec, customCSS))

// start sever
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Error interno del servidor' });
});



app.listen(PORT, (error) => {
    if (!error) {
        console.log(`Running in ${process.env.NODE_ENV}`);
        console.log(`Server on port http://localhost:${PORT}`);
    } else {
        console.log(error);
    }
});

module.exports = app;
