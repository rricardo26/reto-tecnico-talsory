import { Request, ResponseToolkit } from '@hapi/hapi';
import Jwt from '@hapi/jwt';
import { env } from '../config/env';

export class AuthController {
  async generateToken(request: Request, h: ResponseToolkit) {
    try {
      const { sub = 'api-consumer', role = 'user' } =
        (request.payload as { sub?: string; role?: string }) ?? {};

      const token = Jwt.token.generate(
        { aud: 'endorsement-api', iss: 'interseguro', sub, role },
        { key: env.jwt.secret, algorithm: 'HS256' },
        { ttlSec: env.jwt.expiresIn },
      );

      return h
        .response({
          success: true,
          token,
          expiresIn: env.jwt.expiresIn,
        })
        .code(200);
    } catch (err) {
      console.error('[AuthController] error generating token:', err);
      return h.response({ success: false, error: 'Internal server error' }).code(500);
    }
  }
}
