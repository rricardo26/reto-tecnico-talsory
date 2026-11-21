import { DataSource } from 'typeorm';
import { EndorsementTemplateModel } from '../models/EndorsementTemplateModel';
import { TemplateDynamicFieldModel } from '../models/TemplateDynamicFieldModel';
import { TemplateAppliedEventModel } from '../models/TemplateAppliedEventModel';
import {
  CreateTemplateRequestDto,
} from '../entities/template-admin.dto';

export class TemplateAdminService {
  constructor(private readonly dataSource: DataSource) {}

  async listTemplates(): Promise<EndorsementTemplateModel[]> {
    return this.dataSource.getRepository(EndorsementTemplateModel).find({
      relations: { dynamicFields: true, appliedEvents: true },
      order: {
        id: 'ASC',
        dynamicFields: { orderIndex: 'ASC' },
        appliedEvents: { orderEvent: 'ASC' },
      },
    });
  }

  async createTemplate(dto: CreateTemplateRequestDto): Promise<EndorsementTemplateModel> {
    const templateRepo = this.dataSource.getRepository(EndorsementTemplateModel);

    const template = templateRepo.create({
      productCode: dto.productCode,
      endorsementType: dto.endorsementType,
      eventDescription: dto.eventDescription,
      isActive: dto.isActive ?? true,
      dynamicFields: dto.dynamicFields.map((f) => ({
        etiqueta: f.etiqueta,
        sourceField: f.sourceField ?? null,
        defaultValue: f.defaultValue ?? null,
        isRequired: f.isRequired ?? false,
        orderIndex: f.orderIndex,
      })),
      appliedEvents: (dto.appliedEvents ?? []).map((e) => ({
        description: e.description,
        orderEvent: e.orderEvent,
      })),
    });

    return templateRepo.save(template);
  }

  async updateTemplate(
    id: number,
    dto: CreateTemplateRequestDto,
  ): Promise<EndorsementTemplateModel | null> {
    const templateRepo = this.dataSource.getRepository(EndorsementTemplateModel);
    const fieldRepo = this.dataSource.getRepository(TemplateDynamicFieldModel);
    const eventRepo = this.dataSource.getRepository(TemplateAppliedEventModel);

    const template = await templateRepo.findOne({
      where: { id },
      relations: { dynamicFields: true, appliedEvents: true },
    });

    if (!template) return null;

    template.productCode = dto.productCode;
    template.endorsementType = dto.endorsementType;
    template.eventDescription = dto.eventDescription;
    template.isActive = dto.isActive ?? true;

    await fieldRepo.delete({ template: { id: template.id } });
    await eventRepo.delete({ template: { id: template.id } });

    template.dynamicFields = dto.dynamicFields.map((f) =>
      fieldRepo.create({
        etiqueta: f.etiqueta,
        sourceField: f.sourceField ?? null,
        defaultValue: f.defaultValue ?? null,
        isRequired: f.isRequired ?? false,
        orderIndex: f.orderIndex,
        template,
      }),
    );
    template.appliedEvents = (dto.appliedEvents ?? []).map((e) =>
      eventRepo.create({
        description: e.description,
        orderEvent: e.orderEvent,
        template,
      }),
    );

    return templateRepo.save(template);
  }

  async deleteTemplate(id: number): Promise<boolean> {
    const result = await this.dataSource
      .getRepository(EndorsementTemplateModel)
      .delete(id);
    return (result.affected ?? 0) > 0;
  }
}
