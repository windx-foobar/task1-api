import { createRouter } from '@innoagency-arenda/server';

import * as controller from './controller';
import * as bookingsController from './bookings/controller';
import * as authMiddleware from 'app/auth/middleware';

const router = createRouter();

router.get('/', controller.index);
router.get('/:id', controller.show);
router.get('/:id/bookings', bookingsController.index);
router.post(
  '/:id/bookings',
  authMiddleware.isAuthenticated,
  authMiddleware.auth,
  authMiddleware.hasRole('lessee'),
  bookingsController.create
);

export default router;
