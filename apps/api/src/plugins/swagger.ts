import fp from 'fastify-plugin';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { FastifyInstance } from 'fastify';
import { env } from '../config';

// ─────────────────────────────────────────────
// Swagger / OpenAPI Plugin
// ─────────────────────────────────────────────

export default fp(
  async (fastify: FastifyInstance) => {
    // Register OpenAPI spec generator
    await fastify.register(swagger, {
      openapi: {
        openapi: '3.0.3',
        info: {
          title: 'Enterprise POS API',
          description: `
## Enterprise POS System — REST API

Production-grade retail management API built with Fastify and TypeScript.

### Features
- Point of Sale (POS)
- Inventory Management
- Purchase Management
- Customer & Supplier Management
- Accounting & Financial Reports
- Multi-Branch Support
- Role-Based Access Control

### Authentication
All protected endpoints require a **Bearer JWT token** in the Authorization header.

\`\`\`
Authorization: Bearer <access_token>
\`\`\`
        `.trim(),
          version: '1.0.0',
          contact: {
            name: 'Enterprise POS Team',
            email: 'api@enterprise-pos.com',
          },
          license: {
            name: 'MIT',
          },
        },
        servers: [
          {
            url: `http://localhost:${String(env.PORT)}`,
            description: 'Development server',
          },
        ],
        tags: [{ name: 'System', description: 'Health check and system information' }],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
            },
          },
        },
      },
    });

    // Register Swagger UI
    await fastify.register(swaggerUi, {
      routePrefix: '/docs',
      uiConfig: {
        docExpansion: 'list',
        deepLinking: true,
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
        showExtensions: true,
      },
      staticCSP: false,
      transformSpecificationClone: true,
    });
  },
  {
    name: 'swagger-plugin',
  },
);
