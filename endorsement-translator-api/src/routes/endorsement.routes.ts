import { Server } from '@hapi/hapi';
import Joi from 'joi';
import { EndorsementController } from '../controllers/EndorsementController';

export function registerEndorsementRoutes(
  server: Server,
  controller: EndorsementController,
): void {
  server.route({
    method: 'POST',
    path: '/api/v1/endorse/translate',
    options: {
      auth: 'jwt',
      validate: {
        payload: Joi.object({
          policyNumber: Joi.string().required(),
          idEnvio: Joi.number().required(),
          frecuencia: Joi.string().optional(),
          tipoEndoso: Joi.string().required(),
          producto: Joi.string().required(),
          plan: Joi.string().optional(),
          moneda: Joi.string().optional(),
          usuario: Joi.string().optional(),
          fechaSolicitud: Joi.string().optional(),
          fechaCliente: Joi.string().optional(),
          fechaEfectiva: Joi.string().optional(),
        }).unknown(true),
        failAction: (_request, _h, err) => {
          throw err;
        },
      },
      tags: ['api', 'endorse'],
    },
    handler: controller.translate.bind(controller),
  });
}
