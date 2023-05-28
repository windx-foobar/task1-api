import { env } from '@innoagency-arenda/dotenv';

export const auth = {
  apiKey: {
    name: env.API_AUTH_APIKEY_NAME || 'HTTP-Authorization',
    prefix: env.API_AUTH_APIKEY_PREFIX || ''
  }
};
