export class TemplateNotFoundError extends Error {
  constructor(producto: string, tipoEndoso: string) {
    super(
      `No se encontró plantilla activa para producto="${producto}" y tipoEndoso="${tipoEndoso}"`,
    );
    this.name = 'TemplateNotFoundError';
  }
}

export class MissingTemplateFieldError extends Error {
  public readonly missingFields: string[];

  constructor(missingFields: string[]) {
    super(
      `Campos requeridos faltantes: ${missingFields.join(', ')}`,
    );
    this.name = 'MissingTemplateFieldError';
    this.missingFields = missingFields;
  }
}
