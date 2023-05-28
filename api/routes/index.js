import passport from 'passport';
import { NotFoundError, handleRequestError } from '@innoagency-arenda/server/helpers';

import * as authMiddleware from 'app/auth/middleware';

export function defineRoutes(app) {
  app.use(passport.initialize({}));

  app.use('/api', require('app/test').default);
  //
  app.use('/api/ping', require('app/ping').default);

  app.use('/api/auth', require('app/auth').default);
  app.use('/api/me', authMiddleware.isAuthenticated, authMiddleware.auth, require('app/me').default);
  app.use('/api/objects', require('app/objects').default);
  app.use('/api/files', require('app/files').default);

  //
  app.use('/api/lst', require('app/objectCategories').default);
  app.use('/api/dictionary', require('app/dictionary').default);

  //
  app.use(
    '/api/admin/objects',
    authMiddleware.isAuthenticated,
    authMiddleware.auth,
    authMiddleware.hasRole('super_admin'),
    require('app/admin/objects').default
  );

  app.use('/api/*', (req, res) => {
    return handleRequestError({
      res,
      error: new NotFoundError(`Маршрут ${req.method} ${req.originalUrl} не найден`),
      skipTrace: true
    });
  });
}

export default defineRoutes;
