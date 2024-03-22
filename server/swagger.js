const swaggerDoc = require('swagger-jsdoc');
require("dotenv").config({ path: ".env" });
const options = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Your API Documentation',
            version: '1.0.0',
            description: 'Documentation for your APIs',
        },
        servers: [
            {
                url: process.env.ACCESS_CONTROL_ALLOW_ORIGIN 
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    name: 'delivery-app-session-token',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    in: 'header',
                },
            },
        },
    },
    apis: ['./src/routes/*.js']
};
 
const swaggerDocument = swaggerDoc(options);

module.exports = swaggerDocument;