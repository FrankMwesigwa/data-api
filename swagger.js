import swaggerJSDoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        servers: [
            {
                url: "http://104.248.21.177/api/"
            }
        ],
        info: {
            title: 'eAFYA FHIR Mediator APIs',
            version: '1.0.0',
            description: 'API documentation for eAFYA EMR consuming FHIR Based Resources',
            contact: {
                name: "Ministry of Health",
                url: "https://health.go.ug",
                email: "info@health.go.ug"
            }
        }  
    },
    apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;