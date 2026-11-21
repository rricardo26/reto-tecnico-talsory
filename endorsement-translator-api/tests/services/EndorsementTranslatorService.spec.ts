import { EndorsementTranslatorService } from '../../src/services/EndorsementTranslatorService';
import { ITemplateRepository } from '../../src/repositories/ITemplateRepository';
import { IEndorsementMapper } from '../../src/mappers/IEndorsementMapper';
import { EndorsementTemplateModel } from '../../src/models/EndorsementTemplateModel';
import { TemplateDynamicFieldModel } from '../../src/models/TemplateDynamicFieldModel';
import { TemplateAppliedEventModel } from '../../src/models/TemplateAppliedEventModel';
import {
  TranslateEndorseRequestDto,
  CoreEndorseResponseDto,
} from '../../src/entities/endorsement.dto';
import {
  TemplateNotFoundError,
  MissingTemplateFieldError,
} from '../../src/errors/domain.errors';

function makeTemplate(): EndorsementTemplateModel {
  const t = new EndorsementTemplateModel();
  t.id = 1;
  t.productCode = 'Rumbo';
  t.endorsementType = 'CambioFrecuencia';
  t.eventDescription = 'SolicitarEndoso';
  t.isActive = true;
  t.createdAt = new Date();
  t.dynamicFields = [];
  t.appliedEvents = [];
  return t;
}

function makeSuccessResponse(): CoreEndorseResponseDto {
  return {
    policyNumber: '08200000049',
    idEnvio: 5984,
    financialPlansEntity: { description: 'Semestral' },
    currency: { description: 'Nuevo Sol' },
    productEntity: { description: 'Rumbo' },
    eventEntity: {
      description: 'SolicitarEndoso',
      dynamicData: [{ etiqueta: 'NombreUsuario', value: 'Juan' }],
    },
    eventAppliedEntities: [
      { description: 'SolicitarEndoso', orderEvent: 1 },
      { description: 'AprobarEndoso', orderEvent: 2 },
    ],
    riskUnitEntities: [
      {
        insuranceObjectEntities: [
          {
            insuranceObjectNumber: '1',
            coverageEntities: [],
            participationEntities: [],
          },
        ],
        plansEntity: { description: 'PlanRumbo' },
        riskUnitNumber: '1',
      },
    ],
    participationEntities: [],
  };
}

describe('EndorsementTranslatorService', () => {
  let mockRepo: jest.Mocked<ITemplateRepository>;
  let mockMapper: jest.Mocked<IEndorsementMapper>;
  let service: EndorsementTranslatorService;

  const baseDto: TranslateEndorseRequestDto = {
    policyNumber: '08200000049',
    idEnvio: 5984,
    producto: 'Rumbo',
    tipoEndoso: 'CambioFrecuencia',
    usuario: 'Juan',
  };

  beforeEach(() => {
    mockRepo = { findActiveTemplate: jest.fn() };
    mockMapper = { map: jest.fn() };
    service = new EndorsementTranslatorService(mockRepo, mockMapper);
  });

  describe('translate()', () => {
    it('debe retornar el resultado del mapper cuando la plantilla existe', async () => {
      const template = makeTemplate();
      const expected = makeSuccessResponse();

      mockRepo.findActiveTemplate.mockResolvedValue(template);
      mockMapper.map.mockReturnValue(expected);

      const result = await service.translate(baseDto);

      expect(mockRepo.findActiveTemplate).toHaveBeenCalledWith('Rumbo', 'CambioFrecuencia');
      expect(mockMapper.map).toHaveBeenCalledWith(baseDto, template);
      expect(result).toEqual(expected);
    });

    it('debe lanzar TemplateNotFoundError cuando la plantilla no existe', async () => {
      mockRepo.findActiveTemplate.mockResolvedValue(null);

      await expect(service.translate(baseDto)).rejects.toThrow(TemplateNotFoundError);
      expect(mockMapper.map).not.toHaveBeenCalled();
    });

    it('el error debe contener el producto y tipoEndoso en el mensaje', async () => {
      mockRepo.findActiveTemplate.mockResolvedValue(null);

      try {
        await service.translate(baseDto);
        fail('Debería haber lanzado TemplateNotFoundError');
      } catch (err) {
        expect(err).toBeInstanceOf(TemplateNotFoundError);
        expect((err as Error).message).toContain('Rumbo');
        expect((err as Error).message).toContain('CambioFrecuencia');
      }
    });

    it('debe propagar MissingTemplateFieldError desde el mapper', async () => {
      const template = makeTemplate();
      mockRepo.findActiveTemplate.mockResolvedValue(template);
      mockMapper.map.mockImplementation(() => {
        throw new MissingTemplateFieldError(['NombreUsuario', 'FechaEfectiva']);
      });

      await expect(service.translate(baseDto)).rejects.toThrow(MissingTemplateFieldError);
    });

    it('debe funcionar con EndorsementCoreMapper real usando default_value', async () => {
      const { EndorsementCoreMapper } = await import('../../src/mappers/EndorsementCoreMapper');
      const realMapper = new EndorsementCoreMapper();
      const realService = new EndorsementTranslatorService(mockRepo, realMapper);

      const field = new TemplateDynamicFieldModel();
      field.id = 1;
      field.etiqueta = 'TipoEndosoPol';
      field.sourceField = null;
      field.defaultValue = 'Endoso Simple';
      field.isRequired = false;
      field.orderIndex = 1;

      const event = new TemplateAppliedEventModel();
      event.id = 1;
      event.description = 'SolicitarEndoso';
      event.orderEvent = 1;

      const template = makeTemplate();
      template.dynamicFields = [field];
      template.appliedEvents = [event];

      mockRepo.findActiveTemplate.mockResolvedValue(template);

      const dtoWithoutField: TranslateEndorseRequestDto = {
        policyNumber: '08200000049',
        idEnvio: 5984,
        producto: 'Rumbo',
        tipoEndoso: 'CambioFrecuencia',
      };

      const result = await realService.translate(dtoWithoutField);
      expect(result.eventEntity.dynamicData[0]).toEqual({
        etiqueta: 'TipoEndosoPol',
        value: 'Endoso Simple',
      });
    });
  });
});
