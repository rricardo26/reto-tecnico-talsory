export interface TemplateDynamicField {
  id?: number
  etiqueta: string
  sourceField: string | null
  defaultValue: string | null
  isRequired: boolean
  orderIndex: number
}

export interface TemplateAppliedEvent {
  id?: number
  description: string
  orderEvent: number
}

export interface EndorsementTemplate {
  id: number
  productCode: string
  endorsementType: string
  eventDescription: string
  isActive: boolean
  dynamicFields: TemplateDynamicField[]
  appliedEvents: TemplateAppliedEvent[]
}

export interface CreateTemplatePayload {
  productCode: string
  endorsementType: string
  eventDescription: string
  isActive?: boolean
  dynamicFields: {
    etiqueta: string
    sourceField?: string | null
    defaultValue?: string | null
    isRequired?: boolean
    orderIndex: number
  }[]
  appliedEvents?: { description: string; orderEvent: number }[]
}
