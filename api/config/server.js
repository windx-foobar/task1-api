import { env } from '@innoagency-arenda/dotenv';

import { cors } from './cors';

export const server = {
  host: env.API_HOST || 'localhost',
  port: env.API_PORT || 3000,
  modules: [
    // 'helmet',
    env.NODE_ENV === 'production' && 'compression',
    'request-logger',
    cors.enabled && ['cors', { whitelist: cors.whitelist }]
  ]
};
