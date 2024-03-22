const swaggerDoc = require('swagger-jsdoc');

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
                url: `http://e-commerce-store-api-r1dx.onrender.com`  // Change protocol to "http"
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