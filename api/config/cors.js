import { env } from '@innoagency-arenda/dotenv';

export const cors = {
  enabled: env.API_CORS_ENABLED || false,
  whitelist: env.API_CORS_ORIGIN || []
};
