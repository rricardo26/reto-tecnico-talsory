import { IEndorsementMapper } from './IEndorsementMapper';
import { EndorsementTemplateModel } from '../models/EndorsementTemplateModel';
import {
  TranslateEndorseRequestDto,
  CoreEndorseResponseDto,
  DynamicDataEntry,
} from '../entities/endorsement.dto';
import { MissingTemplateFieldError } from '../errors/domain.errors';

export class EndorsementCoreMapper implements IEndorsementMapper {
  map(
    dto: TranslateEndorseRequestDto,
    template: EndorsementTemplateModel,
  ): CoreEndorseResponseDto {
    const missingFields: string[] = [];
    const dynamicData: DynamicDataEntry[] = [];

    for (const field of template.dynamicFields) {
      let valor: string | null = null;

      if (field.sourceField) {
        const raw = dto[field.sourceField];
        if (raw !== undefined && raw !== null) {
          const str = String(raw).trim();
          if (str !== '') valor = str;
        }
      }

      if (valor === null && field.defaultValue !== null) {
        valor = field.defaultValue;
      }

      if (valor === null && field.isRequired) {
        missingFields.push(field.etiqueta);
        continue;
      }

      dynamicData.push({
        etiqueta: field.etiqueta,
        value: valor ?? '',
      });
    }

    if (missingFields.length > 0) {
      throw new MissingTemplateFieldError(missingFields);
    }

    return {
      policyNumber: dto.policyNumber,
      idEnvio: dto.idEnvio,
      financialPlansEntity: {
        description: dto.frecuencia ?? '',
      },
      currency: {
        description: dto.moneda ?? '',
      },
      productEntity: {
        description: dto.producto,
      },
      eventEntity: {
        description: template.eventDescription,
        dynamicData,
      },
      eventAppliedEntities: template.appliedEvents.map((e) => ({
        description: e.description,
        orderEvent: e.orderEvent,
      })),
      riskUnitEntities: [
        {
          insuranceObjectEntities: [
            {
              insuranceObjectNumber: '1',
              coverageEntities: [],
              participationEntities: [],
            },
          ],
          plansEntity: {
            description: dto.plan ?? '',
          },
          riskUnitNumber: '1',
        },
      ],
      participationEntities: [],
    };
  }
}
