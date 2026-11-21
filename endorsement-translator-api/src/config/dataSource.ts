import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { env } from './env';
import { EndorsementTemplateModel } from '../models/EndorsementTemplateModel';
import { TemplateDynamicFieldModel } from '../models/TemplateDynamicFieldModel';
import { TemplateAppliedEventModel } from '../models/TemplateAppliedEventModel';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: env.db.host,
  port: env.db.port,
  username: env.db.username,
  password: env.db.password,
  database: env.db.database,
  synchronize: env.db.synchronize,
  logging: env.nodeEnv === 'development',
  entities: [
    EndorsementTemplateModel,
    TemplateDynamicFieldModel,
    TemplateAppliedEventModel,
  ],
  migrations: [],
  subscribers: [],
});
