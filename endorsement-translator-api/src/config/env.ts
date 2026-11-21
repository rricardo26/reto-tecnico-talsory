import 'dotenv/config';

export const env = {
  port: parseInt(process.env.PORT ?? '3000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  db: {
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    database: process.env.DB_DATABASE ?? 'endorsement_db',
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? 'default-secret-change-in-prod',
    expiresIn: parseInt(process.env.JWT_EXPIRATION ?? '3600', 10),
  },
};
