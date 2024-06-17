const swaggerJSDoc = require('swagger-jsdoc');
const path = require('path');

const options = {
    swaggerDefinition: {
        openapi: '3.0.2',
        tags: [
            {
                name: 'Productos - hook',
                description: 'Operaciones relacionadas con los productos'
            },
            {
                name: 'Procedimientos - hook',
                description: 'Operaciones relacionadas con los procedimientos'
            },
            {
                name: 'Órdenes - hook',
                description: 'Operaciones relacionadas con las órdenes de pedido'
            },
            {
                name: 'Usuarios',
                description: 'Operaciones relacionadas con los usuarios'
            },
            {
                name: 'Ciudades - Departamentos',
                description: 'Operaciones relacionadas con las ciudades y departamentos'
            },
            {
                name: 'Despachos',
                description: 'Operaciones relacionadas con los parámetros de despacho'
            },
            {
                name: 'Pedidos',
                description: 'Operaciones relacionadas con las órdenes de pedido'
            },
            {
                name: 'Productos',
                description: 'Operaciones relacionadas con los productos'
            },
            {
                name: 'Procedimientos',
                description: 'Operaciones relacionadas con los procedimientos'
            },
            {
                name: 'Registros',
                description: 'Operaciones relacionadas con los registros'
            }
        ],
        info: {
            title: 'REST API INTEGRADOR 2.0 - STAGE',
            version: '1.0.0',
            description: 'Peticiones API Para INTEGRADOR 2.0 - STAGE'
        },
        servers: [
            {
                url: 'https://7umhz6r7u1.execute-api.us-east-2.amazonaws.com/stage/shopify/',
                description: 'ApiGateway Server'
            },
            {
                url: 'https://d1b5unq7a0zkti.cloudfront.net/',
                description: 'Lightsail Server'
            }
        ],
        components: {
        },
    },
    apis: [
        path.join(__dirname, '../docs/*.yaml') // Ruta a los archivos YAML en la carpeta docs
    ]
};

const swaggerSpec = swaggerJSDoc(options);

const customCSS = `
    title {
        content: "Nuevo título de la página";
    }

    .topbar-wrapper .link {
        content: url('https://cdn.shopify.com/s/files/1/0673/8637/6424/files/lsk-thumb.png?v=1713735831');
        height: 60px,
        width: 60px,
    }
    .swagger-ui .topbar {
        background-color: red
    }
`;

// Agregar estilos personalizados al HTML generado por Swagger UI
swaggerSpec.customCss = customCSS;

module.exports = swaggerSpec, customCSS;
