// Define the port for the server to listen on
const port = process.env.PORT || 8000;
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
                url: `http://localhost:${port}`
            }
        ]
    },
    apis: ['./src/routes/*.js']
};
const swaggerDocument = swaggerDoc(options)

module.exports = swaggerDocument;
