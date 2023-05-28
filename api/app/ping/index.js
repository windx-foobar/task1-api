import { createRouter } from '@innoagency-arenda/server';

import * as controller from './controller';

const router = createRouter();

router.all('/', controller.index);

export default router;
