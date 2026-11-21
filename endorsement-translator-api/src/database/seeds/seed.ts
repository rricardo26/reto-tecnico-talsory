import 'reflect-metadata';
import 'dotenv/config';
import { Repository } from 'typeorm';
import { AppDataSource } from '../../config/dataSource';
import { EndorsementTemplateModel } from '../../models/EndorsementTemplateModel';
import { TemplateDynamicFieldModel } from '../../models/TemplateDynamicFieldModel';
import { TemplateAppliedEventModel } from '../../models/TemplateAppliedEventModel';

interface DynamicFieldSeed {
  etiqueta: string;
  sourceField: string | null;
  defaultValue: string | null;
  isRequired: boolean;
  orderIndex: number;
}

interface AppliedEventSeed {
  description: string;
  orderEvent: number;
}

interface TemplateSeed {
  productCode: string;
  endorsementType: string;
  eventDescription: string;
  dynamicFields: DynamicFieldSeed[];
  appliedEvents: AppliedEventSeed[];
}

const TEMPLATES: TemplateSeed[] = [
  {
    productCode: 'Rumbo',
    endorsementType: 'CambioFrecuencia',
    eventDescription: 'SolicitarEndoso',
    dynamicFields: [
      { etiqueta: 'ProductosVida',          sourceField: 'producto',        defaultValue: null,        isRequired: true,  orderIndex: 1  },
      { etiqueta: 'NombreUsuario',          sourceField: 'usuario',         defaultValue: null,        isRequired: true,  orderIndex: 2  },
      { etiqueta: 'NumeroPolizaEndoso',     sourceField: 'policyNumber',    defaultValue: null,        isRequired: true,  orderIndex: 3  },
      { etiqueta: 'TipoEndosoPol',          sourceField: null,             defaultValue: 'Endoso Simple', isRequired: false, orderIndex: 4 },
      { etiqueta: 'ResponsableAtencion',    sourceField: null,             defaultValue: 'SAC',       isRequired: false, orderIndex: 5  },
      { etiqueta: 'EndosoModifPrima',       sourceField: null,             defaultValue: 'Si',        isRequired: false, orderIndex: 6  },
      { etiqueta: 'InicioVigenciaEndoso',   sourceField: null,             defaultValue: 'Default',   isRequired: false, orderIndex: 7  },
      { etiqueta: 'TipoVigenciaEndoso',     sourceField: null,             defaultValue: null,        isRequired: false, orderIndex: 8  },
      { etiqueta: 'EndososSimplesSACRumbo', sourceField: null,             defaultValue: 'TES008',    isRequired: false, orderIndex: 9  },
      { etiqueta: 'FechaSolicitud',         sourceField: 'fechaSolicitud', defaultValue: null,        isRequired: true,  orderIndex: 10 },
      { etiqueta: 'FechaCliente',           sourceField: 'fechaCliente',   defaultValue: null,        isRequired: false, orderIndex: 11 },
      { etiqueta: 'FechaEfectiva',          sourceField: 'fechaEfectiva',  defaultValue: null,        isRequired: true,  orderIndex: 12 },
    ],
    appliedEvents: [
      { description: 'SolicitarEndoso', orderEvent: 1 },
      { description: 'AprobarEndoso',   orderEvent: 2 },
    ],
  },
  {
    productCode: 'Rumbo',
    endorsementType: 'EndosoSimple',
    eventDescription: 'SolicitarEndoso',
    dynamicFields: [
      { etiqueta: 'ProductosVida',      sourceField: 'producto',        defaultValue: null,      isRequired: true,  orderIndex: 1 },
      { etiqueta: 'NombreUsuario',      sourceField: 'usuario',         defaultValue: null,      isRequired: true,  orderIndex: 2 },
      { etiqueta: 'NumeroPolizaEndoso', sourceField: 'policyNumber',    defaultValue: null,      isRequired: true,  orderIndex: 3 },
      { etiqueta: 'TipoEndosoPol',      sourceField: null,             defaultValue: 'Endoso Simple', isRequired: false, orderIndex: 4 },
      { etiqueta: 'MotivoEndoso',       sourceField: 'motivoEndoso',   defaultValue: 'Actualizacion de datos', isRequired: false, orderIndex: 5 },
      { etiqueta: 'FechaSolicitud',     sourceField: 'fechaSolicitud', defaultValue: null,      isRequired: true,  orderIndex: 6 },
      { etiqueta: 'FechaEfectiva',      sourceField: 'fechaEfectiva',  defaultValue: null,      isRequired: true,  orderIndex: 7 },
    ],
    appliedEvents: [
      { description: 'SolicitarEndoso', orderEvent: 1 },
    ],
  },
];

async function seedTemplate(
  templateSeed: TemplateSeed,
  templateRepo: Repository<EndorsementTemplateModel>,
  fieldRepo: Repository<TemplateDynamicFieldModel>,
  eventRepo: Repository<TemplateAppliedEventModel>,
): Promise<void> {
  let template = await templateRepo.findOne({
    where: {
      productCode: templateSeed.productCode,
      endorsementType: templateSeed.endorsementType,
    },
  });

  if (!template) {
    template = await templateRepo.save(
      templateRepo.create({
        productCode: templateSeed.productCode,
        endorsementType: templateSeed.endorsementType,
        eventDescription: templateSeed.eventDescription,
        isActive: true,
      }),
    );
  }

  // Seed defaults only when the template has no related rows yet,
  // so existing data is never wiped on container restart.
  const existingFields = await fieldRepo.count({
    where: { template: { id: template.id } },
  });

  if (existingFields === 0) {
    await fieldRepo.save(
      templateSeed.dynamicFields.map((f) =>
        fieldRepo.create({ ...f, template: template! }),
      ),
    );
    console.log(
      `Seeded ${templateSeed.dynamicFields.length} dynamic fields for ${templateSeed.productCode}/${templateSeed.endorsementType}.`,
    );
  }

  const existingEvents = await eventRepo.count({
    where: { template: { id: template.id } },
  });

  if (existingEvents === 0) {
    await eventRepo.save(
      templateSeed.appliedEvents.map((e) =>
        eventRepo.create({ ...e, template: template! }),
      ),
    );
    console.log(
      `Seeded ${templateSeed.appliedEvents.length} applied events for ${templateSeed.productCode}/${templateSeed.endorsementType}.`,
    );
  }
}

async function seed(): Promise<void> {
  await AppDataSource.initialize();

  const templateRepo = AppDataSource.getRepository(EndorsementTemplateModel);
  const fieldRepo = AppDataSource.getRepository(TemplateDynamicFieldModel);
  const eventRepo = AppDataSource.getRepository(TemplateAppliedEventModel);

  for (const templateSeed of TEMPLATES) {
    await seedTemplate(templateSeed, templateRepo, fieldRepo, eventRepo);
  }

  await AppDataSource.destroy();
  console.log('Seed executed successfully.');
}

seed().catch((err) => {
  console.error('Seed execution error:', err);
  process.exit(1);
});
