import { createRouter } from '@innoagency-arenda/server';
import { getDatabase } from '@innoagency-arenda/database';

import * as middleware from './middleware';
import * as controller from './controller';

const db = getDatabase();

require('./passport/local').setup(db.models);
require('./passport/token').setup(db.models);

const router = createRouter();

router.post('/register', controller.register);
router.post('/register/:token/confirm', controller.confirmRegister);
router.delete('/register/:token/destroy', controller.destroyConfirm);
router.post('/login', middleware.login, controller.login);
router.post('/logout', middleware.isAuthenticated, controller.logout);
router.post('/forgot-password', controller.forgotPassword);
router.post('/forgot-password/:token/confirm', controller.changePassword);
router.delete('/forgot-password/:token/destroy', controller.destroyConfirm);

export default router;
