import { DataSource } from 'typeorm';
import { ITemplateRepository } from './ITemplateRepository';
import { EndorsementTemplateModel } from '../models/EndorsementTemplateModel';

export class TypeOrmTemplateRepository implements ITemplateRepository {
  private readonly repo;

  constructor(private readonly dataSource: DataSource) {
    this.repo = dataSource.getRepository(EndorsementTemplateModel);
  }

  async findActiveTemplate(
    productCode: string,
    endorsementType: string,
  ): Promise<EndorsementTemplateModel | null> {
    return this.repo.findOne({
      where: { productCode, endorsementType, isActive: true },
      relations: { dynamicFields: true, appliedEvents: true },
      order: {
        dynamicFields: { orderIndex: 'ASC' },
        appliedEvents: { orderEvent: 'ASC' },
      },
    });
  }
}
