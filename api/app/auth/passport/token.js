import passport from 'passport';
import { HeaderAPIKeyStrategy } from 'passport-headerapikey';

import * as config from 'config';

export const WRONG_CREDENTIALS = { message: 'API key not found', code: 401 };

export function setup(models) {
  passport.use(
    'token',
    new HeaderAPIKeyStrategy(
      {
        header: config.auth.apiKey.name,
        prefix: config.auth.apiKey.prefix
      },
      false,
      async (token, done) => {
        try {
          const authTokensRow = await models.authTokens.unscoped().findOne({
            include: [{ association: 'user', required: true }],
            where: {
              token
            }
          });

          if (!authTokensRow) return done(null, false, WRONG_CREDENTIALS);

          return done(null, authTokensRow.user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );
}
