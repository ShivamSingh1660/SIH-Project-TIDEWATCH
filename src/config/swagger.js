const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TantraFiesta Admin API',
      version: '1.0.0',
      description:
        'Admin panel backend API for TantraFiesta — manage events, registrations, teams, rounds, and results.',
    },
    servers: [
      {
        url: 'http://localhost:{port}',
        description: 'Local development server',
        variables: {
          port: { default: '3000' },
        },
      },
    ],
    components: {
      securitySchemes: {
        // Placeholder — auth middleware will be plugged in by the RBAC team
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description:
            'Supabase JWT token. Not enforced yet — will be wired when RBAC is ready.',
        },
      },
    },
    // Apply globally so Swagger UI shows the lock icon on all admin endpoints
    security: [{ BearerAuth: [] }],
  },
  apis: ['./src/routes/admin/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
