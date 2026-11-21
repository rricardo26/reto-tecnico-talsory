import { Server } from '@hapi/hapi';
import Joi from 'joi';
import { AuthController } from '../controllers/AuthController';

export function registerAuthRoutes(server: Server): void {
  const controller = new AuthController();

  server.route({
    method: 'POST',
    path: '/api/v1/auth/token',
    options: {
      auth: false,
      validate: {
        payload: Joi.object({
          sub: Joi.string().optional(),
          role: Joi.string().optional(),
        }).allow(null),
        failAction: (_request, _h, err) => {
          throw err;
        },
      },
      tags: ['api', 'auth'],
    },
    handler: controller.generateToken.bind(controller),
  });
}
