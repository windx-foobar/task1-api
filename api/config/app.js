import { env } from '@innoagency-arenda/dotenv';

import { server } from './server';

export const app = {
  url: `http://${server.host}:${server.port}`,
  isDev: !env.NODE_ENV || env.NODE_ENV === 'development',
  // isTest: env.NODE_ENV === 'test',
  // isStaging: env.NODE_ENV === 'staging',
  isProduction: env.NODE_ENV === 'production'
};
