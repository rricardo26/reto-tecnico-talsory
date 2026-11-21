import { Request, ResponseToolkit } from '@hapi/hapi';
import { EndorsementTranslatorService } from '../services/EndorsementTranslatorService';
import { TranslateEndorseRequestDto } from '../entities/endorsement.dto';
import {
  TemplateNotFoundError,
  MissingTemplateFieldError,
} from '../errors/domain.errors';

export class EndorsementController {
  constructor(
    private readonly translatorService: EndorsementTranslatorService,
  ) {}

  async translate(request: Request, h: ResponseToolkit) {
    try {
      const payload = request.payload as TranslateEndorseRequestDto;
      const result = await this.translatorService.translate(payload);
      return h.response({ success: true, data: result }).code(200);
    } catch (err) {
      if (err instanceof TemplateNotFoundError) {
        return h
          .response({ success: false, error: err.message })
          .code(404);
      }
      if (err instanceof MissingTemplateFieldError) {
        return h
          .response({
            success: false,
            error: err.message,
            details: { missingFields: err.missingFields },
          })
          .code(400);
      }
      console.error('[EndorsementController] unexpected error:', err);
      return h.response({ success: false, error: 'Internal server error' }).code(500);
    }
  }
}
