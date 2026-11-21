export interface EndorseInputPayload {
  policyNumber: string
  idEnvio: number
  frecuencia?: string
  tipoEndoso: string
  producto: string
  plan?: string
  moneda?: string
  usuario?: string
  fechaSolicitud?: string
  fechaCliente?: string
  fechaEfectiva?: string
  [key: string]: unknown
}

export interface EndorseFormFields {
  producto: string
  tipoEndoso: string
  policyNumber: string
  idEnvio: string
  frecuencia: string
  plan: string
  moneda: string
  usuario: string
  fechaSolicitud: string
  fechaCliente: string
  fechaEfectiva: string
  inicioVigenciaEndoso?: string
  responsableAtencion?: string
  extraFields: { key: string; value: string }[]
}

export interface DescriptionEntity {
  description: string
}

export interface DynamicDataEntry {
  etiqueta: string
  value: string
}

export interface EventEntity extends DescriptionEntity {
  dynamicData: DynamicDataEntry[]
}

export interface AppliedEventEntity {
  description: string
  orderEvent: number
}

export interface InsuranceObjectEntity {
  insuranceObjectNumber: string
  coverageEntities: unknown[]
  participationEntities: unknown[]
}

export interface RiskUnitEntity {
  insuranceObjectEntities: InsuranceObjectEntity[]
  plansEntity: DescriptionEntity
  riskUnitNumber: string
}

export interface CoreEndorseOutput {
  policyNumber: string
  idEnvio: number
  financialPlansEntity: DescriptionEntity
  currency: DescriptionEntity
  productEntity: DescriptionEntity
  eventEntity: EventEntity
  eventAppliedEntities: AppliedEventEntity[]
  riskUnitEntities: RiskUnitEntity[]
  participationEntities: unknown[]
}

export interface ApiSuccessResponse<T> {
  success: true
  data: T
}

export interface ApiErrorResponse {
  success: false
  error: string
  details?: {
    missingFields?: string[]
  }
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

export interface TranslateResult {
  status: number
  data: CoreEndorseOutput | null
  error: string | null
  missingFields: string[]
}

export interface TokenResult {
  token: string
  expiresIn: number
}
