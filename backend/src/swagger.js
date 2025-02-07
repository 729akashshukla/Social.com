import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';


const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'User Authentication API',
    version: '1.0.0',
    description: 'API documentation for user registration, login, OTP etc.',
  },
  servers: [
    {
      url: 'http://localhost:8000',
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./src/controllers/*.js', './src/routes/*.js'], // Make sure paths are correct
};


const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
