import 'reflect-metadata';
import 'dotenv/config';
import Hapi from '@hapi/hapi';
import HapiJwt from '@hapi/jwt';
import { AppDataSource } from './config/dataSource';
import { env } from './config/env';
import { TypeOrmTemplateRepository } from './repositories/TypeOrmTemplateRepository';
import { EndorsementCoreMapper } from './mappers/EndorsementCoreMapper';
import { EndorsementTranslatorService } from './services/EndorsementTranslatorService';
import { EndorsementController } from './controllers/EndorsementController';
import { TemplateAdminController } from './controllers/TemplateAdminController';
import { TemplateAdminService } from './services/TemplateAdminService';
import { registerEndorsementRoutes } from './routes/endorsement.routes';
import { registerAuthRoutes } from './routes/auth.routes';
import { registerTemplateAdminRoutes } from './routes/template.routes';

async function buildServer(): Promise<Hapi.Server> {
  const server = Hapi.server({
    port: env.port,
    host: '0.0.0.0',
    routes: {
      cors: {
        origin: ['*'],
        headers: ['Accept', 'Authorization', 'Content-Type'],
        additionalHeaders: ['X-Requested-With'],
      },
    },
  });

  await server.register(HapiJwt);

  server.auth.strategy('jwt', 'jwt', {
    keys: env.jwt.secret,
    verify: {
      aud: 'endorsement-api',
      iss: 'interseguro',
      sub: false,
    },
    validate: async (artifacts: any) => ({
      isValid: true,
      credentials: { user: artifacts.decoded.payload },
    }),
  });

  server.auth.default('jwt');

  const templateRepository = new TypeOrmTemplateRepository(AppDataSource);
  const endorsementMapper = new EndorsementCoreMapper();
  const translatorService = new EndorsementTranslatorService(
    templateRepository,
    endorsementMapper,
  );
  const endorsementController = new EndorsementController(translatorService);
  const templateAdminService = new TemplateAdminService(AppDataSource);
  const templateAdminController = new TemplateAdminController(templateAdminService);

  registerEndorsementRoutes(server, endorsementController);
  registerAuthRoutes(server);
  registerTemplateAdminRoutes(server, templateAdminController);

  return server;
}

async function main(): Promise<void> {
  try {
    await AppDataSource.initialize();
    const server = await buildServer();
    await server.start();
    console.log(`Server listening on ${server.info.uri}`);
  } catch (err) {
    console.error('Fatal startup error:', err);
    process.exit(1);
  }
}

main();
