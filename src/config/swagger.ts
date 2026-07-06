import swaggerJsdoc from 'swagger-jsdoc';
import openapi from './openapi.json' with { type: 'json' };

const options: swaggerJsdoc.Options = {
    definition: openapi,
    apis: ['./src/docs/**/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
