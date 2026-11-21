export interface TranslateEndorseRequestDto {
  policyNumber: string;
  idEnvio: number;
  frecuencia?: string;
  tipoEndoso: string;
  producto: string;
  plan?: string;
  moneda?: string;
  usuario?: string;
  fechaSolicitud?: string;
  fechaCliente?: string;
  fechaEfectiva?: string;
  [key: string]: unknown;
}

export interface DescriptionEntity {
  description: string;
}

export interface DynamicDataEntry {
  etiqueta: string;
  value: string;
}

export interface EventEntity extends DescriptionEntity {
  dynamicData: DynamicDataEntry[];
}

export interface AppliedEventEntity {
  description: string;
  orderEvent: number;
}

export interface InsuranceObjectEntity {
  insuranceObjectNumber: string;
  coverageEntities: unknown[];
  participationEntities: unknown[];
}

export interface PlansEntity {
  description: string;
}

export interface RiskUnitEntity {
  insuranceObjectEntities: InsuranceObjectEntity[];
  plansEntity: PlansEntity;
  riskUnitNumber: string;
}

export interface CoreEndorseResponseDto {
  policyNumber: string;
  idEnvio: number;
  financialPlansEntity: DescriptionEntity;
  currency: DescriptionEntity;
  productEntity: DescriptionEntity;
  eventEntity: EventEntity;
  eventAppliedEntities: AppliedEventEntity[];
  riskUnitEntities: RiskUnitEntity[];
  participationEntities: unknown[];
}
