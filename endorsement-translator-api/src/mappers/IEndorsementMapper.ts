import { EndorsementTemplateModel } from '../models/EndorsementTemplateModel';
import {
  TranslateEndorseRequestDto,
  CoreEndorseResponseDto,
} from '../entities/endorsement.dto';

export interface IEndorsementMapper {
  map(
    dto: TranslateEndorseRequestDto,
    template: EndorsementTemplateModel,
  ): CoreEndorseResponseDto;
}
