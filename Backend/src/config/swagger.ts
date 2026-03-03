
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id: { type: string }
 *         email: { type: string }
 *         name: { type: string }
 *         role: { type: string, enum: [TEAM_MEMBER, TEAM_LEAD] }
 *     BacklogItem:
 *       type: object
 *       properties:
 *         title: { type: string }
 *         description: { type: string }
 *         category: { type: string, enum: [CLIENT, TECH_DEBT, RND] }
 *         estimatedHours: { type: number }
 */

export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Weekly Planning System API',
    version: '1.0.0',
    description: 'API for managing weekly planning and task assignments',
  },
  servers: [
    {
      url: 'http://localhost:3000/api/v1',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  paths: {
    '/auth/signup': {
      post: {
        tags: ['Auth'],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string' },
                  password: { type: 'string' },
                  name: { type: 'string' },
                  role: { type: 'string' }
                }
              }
            }
          }
        },
        responses: { 201: { description: 'Created' } }
      }
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string' },
                  password: { type: 'string' }
                }
              }
            }
          }
        },
        responses: { 200: { description: 'Success' } }
      }
    },
    '/backlog': {
      get: {
        tags: ['Backlog'],
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Success' } }
      },
      post: {
        tags: ['Backlog'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  category: { type: 'string' },
                  estimatedHours: { type: 'number' }
                }
              }
            }
          }
        },
        responses: { 201: { description: 'Created' } }
      }
    }
    // Summary version for now, full version could be huge
  }
};
