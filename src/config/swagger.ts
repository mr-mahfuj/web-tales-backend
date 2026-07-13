import swaggerAutogen from 'swagger-autogen';

const swagger = swaggerAutogen({ openapi: '3.0.0' });

const doc = {
    info: {
        title: 'Web Tales',
        description: 'API Documentation',
        version: '1.0.0',
    },
    servers: [
        {
            url: 'http://localhost:3000',
        },
    ],
};

const outputFile = './src/config/openapi.json';
const endpointsFiles = ['./src/routes/index.ts'];

await swagger(outputFile, endpointsFiles, doc);
