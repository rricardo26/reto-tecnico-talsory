import { EndorsementCoreMapper } from '../../src/mappers/EndorsementCoreMapper';
import { EndorsementTemplateModel } from '../../src/models/EndorsementTemplateModel';
import { TemplateDynamicFieldModel } from '../../src/models/TemplateDynamicFieldModel';
import { TemplateAppliedEventModel } from '../../src/models/TemplateAppliedEventModel';
import { TranslateEndorseRequestDto } from '../../src/entities/endorsement.dto';
import { MissingTemplateFieldError } from '../../src/errors/domain.errors';

function makeField(overrides: Partial<TemplateDynamicFieldModel>): TemplateDynamicFieldModel {
  const f = new TemplateDynamicFieldModel();
  f.id = overrides.id ?? 1;
  f.etiqueta = overrides.etiqueta ?? 'Campo';
  f.sourceField = overrides.sourceField ?? null;
  f.defaultValue = overrides.defaultValue ?? null;
  f.isRequired = overrides.isRequired ?? false;
  f.orderIndex = overrides.orderIndex ?? 1;
  return f;
}

function makeEvent(description: string, order: number): TemplateAppliedEventModel {
  const e = new TemplateAppliedEventModel();
  e.id = order;
  e.description = description;
  e.orderEvent = order;
  return e;
}

function makeTemplate(
  fields: TemplateDynamicFieldModel[],
  events: TemplateAppliedEventModel[],
): EndorsementTemplateModel {
  const t = new EndorsementTemplateModel();
  t.id = 1;
  t.productCode = 'Rumbo';
  t.endorsementType = 'CambioFrecuencia';
  t.eventDescription = 'SolicitarEndoso';
  t.isActive = true;
  t.createdAt = new Date();
  t.dynamicFields = fields;
  t.appliedEvents = events;
  return t;
}

const baseDto: TranslateEndorseRequestDto = {
  policyNumber: '08200000049',
  idEnvio: 5984,
  producto: 'Rumbo',
  tipoEndoso: 'CambioFrecuencia',
  plan: 'PlanRumbo',
  moneda: 'Nuevo Sol',
  frecuencia: 'Semestral',
  usuario: 'interface.servicios',
  fechaSolicitud: '2025-08-27',
  fechaCliente: '2025-08-27',
  fechaEfectiva: '2025-09-01',
};

describe('EndorsementCoreMapper', () => {
  let mapper: EndorsementCoreMapper;

  beforeEach(() => {
    mapper = new EndorsementCoreMapper();
  });

  describe('map()', () => {
    it('debe mapear correctamente usando source_field del payload', () => {
      const fields = [
        makeField({ etiqueta: 'NombreUsuario', sourceField: 'usuario', isRequired: true, orderIndex: 1 }),
        makeField({ etiqueta: 'NumeroPolizaEndoso', sourceField: 'policyNumber', isRequired: true, orderIndex: 2 }),
      ];
      const events = [
        makeEvent('SolicitarEndoso', 1),
        makeEvent('AprobarEndoso', 2),
      ];
      const template = makeTemplate(fields, events);

      const result = mapper.map(baseDto, template);

      expect(result.policyNumber).toBe('08200000049');
      expect(result.idEnvio).toBe(5984);
      expect(result.productEntity).toEqual({ description: 'Rumbo' });
      expect(result.eventEntity.description).toBe('SolicitarEndoso');
      expect(result.eventEntity.dynamicData).toEqual([
        { etiqueta: 'NombreUsuario', value: 'interface.servicios' },
        { etiqueta: 'NumeroPolizaEndoso', value: '08200000049' },
      ]);
      expect(result.eventAppliedEntities).toEqual([
        { description: 'SolicitarEndoso', orderEvent: 1 },
        { description: 'AprobarEndoso', orderEvent: 2 },
      ]);
      expect(result.financialPlansEntity).toEqual({ description: 'Semestral' });
      expect(result.currency).toEqual({ description: 'Nuevo Sol' });
      expect(result.riskUnitEntities).toEqual([
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
      ]);
      expect(result.participationEntities).toEqual([]);
    });

    it('debe usar default_value cuando source_field no viene en el payload', () => {
      const fields = [
        makeField({ etiqueta: 'ProductosVida', sourceField: 'producto', isRequired: true, orderIndex: 1 }),
        makeField({ etiqueta: 'TipoEndosoPol', sourceField: null, defaultValue: 'Endoso Simple', isRequired: false, orderIndex: 2 }),
      ];
      const template = makeTemplate(fields, []);

      const result = mapper.map(baseDto, template);

      expect(result.eventEntity.dynamicData).toEqual([
        { etiqueta: 'ProductosVida', value: 'Rumbo' },
        { etiqueta: 'TipoEndosoPol', value: 'Endoso Simple' },
      ]);
    });

    it('debe emitir value vacío para campos opcionales sin valor ni default', () => {
      const fields = [
        makeField({ etiqueta: 'TipoVigenciaEndoso', sourceField: null, isRequired: false, orderIndex: 1 }),
      ];
      const template = makeTemplate(fields, []);

      const result = mapper.map(baseDto, template);
      expect(result.eventEntity.dynamicData[0]).toEqual({
        etiqueta: 'TipoVigenciaEndoso',
        value: '',
      });
    });

    it('debe lanzar MissingTemplateFieldError cuando un campo is_required no tiene valor ni default', () => {
      const fields = [
        makeField({ etiqueta: 'NombreUsuario', sourceField: 'usuario', isRequired: true, orderIndex: 1 }),
        makeField({ etiqueta: 'FechaEfectiva', sourceField: 'fechaEfectiva', isRequired: true, orderIndex: 2 }),
      ];
      const template = makeTemplate(fields, []);

      const dto: TranslateEndorseRequestDto = {
        policyNumber: '08200000049',
        idEnvio: 5984,
        producto: 'Rumbo',
        tipoEndoso: 'CambioFrecuencia',
      };

      expect(() => mapper.map(dto, template)).toThrow(MissingTemplateFieldError);
    });

    it('debe lanzar MissingTemplateFieldError si un campo is_required viene como string vacío', () => {
      const fields = [
        makeField({ etiqueta: 'NombreUsuario', sourceField: 'usuario', isRequired: true, orderIndex: 1 }),
      ];
      const template = makeTemplate(fields, []);

      const dto: TranslateEndorseRequestDto = {
        ...baseDto,
        usuario: '   ',
      };

      expect(() => mapper.map(dto, template)).toThrow(MissingTemplateFieldError);
    });

    it('debe incluir todos los campos faltantes en el error', () => {
      const fields = [
        makeField({ etiqueta: 'NombreUsuario', sourceField: 'usuario', isRequired: true, orderIndex: 1 }),
        makeField({ etiqueta: 'NumeroPolizaEndoso', sourceField: 'policyNumber', isRequired: true, orderIndex: 2 }),
        makeField({ etiqueta: 'FechaEfectiva', sourceField: 'fechaEfectiva', isRequired: true, orderIndex: 3 }),
      ];
      const template = makeTemplate(fields, []);

      const dto: TranslateEndorseRequestDto = {
        idEnvio: 1,
        producto: 'Rumbo',
        tipoEndoso: 'CambioFrecuencia',
        policyNumber: '',
      };

      try {
        mapper.map(dto, template);
        fail('Debería haber lanzado MissingTemplateFieldError');
      } catch (err) {
        expect(err).toBeInstanceOf(MissingTemplateFieldError);
        const missingErr = err as MissingTemplateFieldError;
        expect(missingErr.missingFields).toEqual([
          'NombreUsuario',
          'NumeroPolizaEndoso',
          'FechaEfectiva',
        ]);
      }
    });

    it('no debe lanzar error si el campo requerido viene en el payload', () => {
      const fields = [
        makeField({ etiqueta: 'NombreUsuario', sourceField: 'usuario', isRequired: true, orderIndex: 1 }),
      ];
      const template = makeTemplate(fields, []);

      expect(() => mapper.map(baseDto, template)).not.toThrow();
    });
  });
});
