export interface TemplateDynamicFieldInput {
  etiqueta: string;
  sourceField?: string | null;
  defaultValue?: string | null;
  isRequired?: boolean;
  orderIndex: number;
}

export interface TemplateAppliedEventInput {
  description: string;
  orderEvent: number;
}

export interface CreateTemplateRequestDto {
  productCode: string;
  endorsementType: string;
  eventDescription: string;
  isActive?: boolean;
  dynamicFields: TemplateDynamicFieldInput[];
  appliedEvents?: TemplateAppliedEventInput[];
}
