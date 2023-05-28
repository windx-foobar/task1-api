import { createRouter } from '@innoagency-arenda/server';

import * as controller from './controller';

const router = createRouter();

router.get('/object-categories', controller.index);

export default router;
