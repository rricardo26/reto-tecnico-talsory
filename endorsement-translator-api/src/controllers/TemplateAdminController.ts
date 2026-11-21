import { Request, ResponseToolkit } from '@hapi/hapi';
import { TemplateAdminService } from '../services/TemplateAdminService';
import { CreateTemplateRequestDto } from '../entities/template-admin.dto';

export class TemplateAdminController {
  constructor(private readonly adminService: TemplateAdminService) {}

  async list(request: Request, h: ResponseToolkit) {
    const templates = await this.adminService.listTemplates();
    return h.response({ success: true, data: templates }).code(200);
  }

  async create(request: Request, h: ResponseToolkit) {
    const dto = request.payload as CreateTemplateRequestDto;
    try {
      const template = await this.adminService.createTemplate(dto);
      return h.response({ success: true, data: template }).code(201);
    } catch (err: any) {
      if (err?.code === '23505') {
        return h
          .response({
            success: false,
            error:
              'Ya existe una plantilla para ese producto y tipo de endoso.',
          })
          .code(409);
      }
      console.error('[TemplateAdminController] create error:', err);
      return h
        .response({ success: false, error: 'Internal server error' })
        .code(500);
    }
  }

  async update(request: Request, h: ResponseToolkit) {
    const id = Number((request.params as { id: string }).id);
    const dto = request.payload as CreateTemplateRequestDto;
    try {
      const template = await this.adminService.updateTemplate(id, dto);
      if (!template) {
        return h
          .response({ success: false, error: 'Plantilla no encontrada.' })
          .code(404);
      }
      return h.response({ success: true, data: template }).code(200);
    } catch (err: any) {
      if (err?.code === '23505') {
        return h
          .response({
            success: false,
            error:
              'Ya existe una plantilla para ese producto y tipo de endoso.',
          })
          .code(409);
      }
      console.error('[TemplateAdminController] update error:', err);
      return h
        .response({ success: false, error: 'Internal server error' })
        .code(500);
    }
  }

  async remove(request: Request, h: ResponseToolkit) {
    const id = Number((request.params as { id: string }).id);
    const deleted = await this.adminService.deleteTemplate(id);
    if (!deleted) {
      return h
        .response({ success: false, error: 'Plantilla no encontrada.' })
        .code(404);
    }
    return h.response({ success: true }).code(200);
  }
}
