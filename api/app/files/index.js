import { createRouter } from '@innoagency-arenda/server';
import multer from 'multer';

import * as authMiddleware from 'app/auth/middleware';
import * as controller from './controller';
import { defaultStorage } from './storage';

const uploadOptions = { limits: { fileSize: 15728640 } };

const upload = multer({ storage: defaultStorage, ...uploadOptions });
const router = createRouter();

router.post(
  '/',
  authMiddleware.isAuthenticated,
  authMiddleware.auth,
  authMiddleware.hasRole('owner'),
  upload.single('file'),
  controller.upload
);
router.get('/:id', controller.show);
router.delete('/:id', controller.destroy);

export default router;
