import { Server } from '@hapi/hapi';
import Joi from 'joi';
import { TemplateAdminController } from '../controllers/TemplateAdminController';

const templatePayloadSchema = Joi.object({
  productCode: Joi.string().required(),
  endorsementType: Joi.string().required(),
  eventDescription: Joi.string().required(),
  isActive: Joi.boolean().optional(),
  dynamicFields: Joi.array()
    .items(
      Joi.object({
        etiqueta: Joi.string().required(),
        sourceField: Joi.string().allow(null, '').optional(),
        defaultValue: Joi.string().allow(null, '').optional(),
        isRequired: Joi.boolean().optional(),
        orderIndex: Joi.number().required(),
      }),
    )
    .min(1)
    .required(),
  appliedEvents: Joi.array()
    .items(
      Joi.object({
        description: Joi.string().required(),
        orderEvent: Joi.number().required(),
      }),
    )
    .optional(),
});

const paramsIdSchema = Joi.object({
  id: Joi.number().integer().required(),
});

export function registerTemplateAdminRoutes(
  server: Server,
  controller: TemplateAdminController,
): void {
  server.route([
    {
      method: 'GET',
      path: '/api/v1/templates',
      options: {
        auth: 'jwt',
        tags: ['api', 'templates'],
      },
      handler: controller.list.bind(controller),
    },
    {
      method: 'POST',
      path: '/api/v1/templates',
      options: {
        auth: 'jwt',
        validate: {
          payload: templatePayloadSchema,
          failAction: (_request, _h, err) => {
            throw err;
          },
        },
        tags: ['api', 'templates'],
      },
      handler: controller.create.bind(controller),
    },
    {
      method: 'PUT',
      path: '/api/v1/templates/{id}',
      options: {
        auth: 'jwt',
        validate: {
          params: paramsIdSchema,
          payload: templatePayloadSchema,
          failAction: (_request, _h, err) => {
            throw err;
          },
        },
        tags: ['api', 'templates'],
      },
      handler: controller.update.bind(controller),
    },
    {
      method: 'DELETE',
      path: '/api/v1/templates/{id}',
      options: {
        auth: 'jwt',
        validate: {
          params: paramsIdSchema,
        },
        tags: ['api', 'templates'],
      },
      handler: controller.remove.bind(controller),
    },
  ]);
}
