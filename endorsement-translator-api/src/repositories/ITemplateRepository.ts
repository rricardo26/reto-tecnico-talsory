import { EndorsementTemplateModel } from '../models/EndorsementTemplateModel';

export interface ITemplateRepository {
  findActiveTemplate(
    productCode: string,
    endorsementType: string,
  ): Promise<EndorsementTemplateModel | null>;
}
