import { createRouter } from '@innoagency-arenda/server';

import * as controller from './controller';

const router = createRouter();

router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/:id/confirm', controller.confirm);
router.post('/:id/refuse', controller.refuse);

export default router;
