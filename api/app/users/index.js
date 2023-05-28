import { createRouter } from '@innoagency-arenda/server';

import * as controller from './controller';

const router = createRouter();

router.get('/me', controller.meIndex);
router.put('/me', controller.meUpdate);
router.post('/me/reset-password', controller.meResetPassword);

export default router;
