import { ITemplateRepository } from '../repositories/ITemplateRepository';
import { IEndorsementMapper } from '../mappers/IEndorsementMapper';
import {
  TranslateEndorseRequestDto,
  CoreEndorseResponseDto,
} from '../entities/endorsement.dto';
import { TemplateNotFoundError } from '../errors/domain.errors';

export class EndorsementTranslatorService {
  constructor(
    private readonly templateRepository: ITemplateRepository,
    private readonly endorsementMapper: IEndorsementMapper,
  ) {}

  async translate(dto: TranslateEndorseRequestDto): Promise<CoreEndorseResponseDto> {
    const template = await this.templateRepository.findActiveTemplate(
      dto.producto,
      dto.tipoEndoso,
    );

    if (!template) {
      throw new TemplateNotFoundError(dto.producto, dto.tipoEndoso);
    }

    return this.endorsementMapper.map(dto, template);
  }
}
