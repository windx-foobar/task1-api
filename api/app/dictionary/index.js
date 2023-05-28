import { createRouter } from '@innoagency-arenda/server';

import * as controller from './controller';

const router = createRouter();

router.get('/object-status', controller.objectStatus);

export default router;
