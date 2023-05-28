import { resolve } from 'node:path';
import { env } from '@innoagency-arenda/dotenv';

export const database = {
  migrations: {
    glob: resolve(__dirname, '../database/migrations/**/*.js').replace(/\\/g, '/')
  },
  modelsDir: resolve(__dirname, '../app'),
  seedsDir: resolve(__dirname, '../database/seeds'),
  sequelize: {
    dialect: 'postgres',
    host: env.API_DATABASE_HOST,
    port: env.API_DATABASE_PORT,
    database: env.API_DATABASE_NAME,
    username: env.API_DATABASE_USER,
    password: env.API_DATABASE_PASSWORD,
    pool: { max: 5, min: 0, idle: 10000 },
    logging: false,
    define: {
      underscored: true,
      underscoredAll: true,
      underscoredAttributes: true,
      paranoid: true
    },
    dialectOptions: {
      multipleStatements: true
    }
  }
};
