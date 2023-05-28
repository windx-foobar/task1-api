import * as processMigrate from './migrate';
import { process as processSeed } from './seed';

export async function process(args = {}) {
  const fill = args?.fill || false;

  try {
    await processMigrate.down({ to: '20230519003000-init.js' });
  } catch (error) {
    if (error.message !== `Couldn't find migration to apply with name ${JSON.stringify('20230519003000-init.js')}`) {
      throw error;
    }
  }

  await processMigrate.up({ to: '20230524114100-init-fill-and-alter-lst_object_categories.js' });
  await processSeed({ name: '20230519003000-add-roles' });
  await processSeed({ name: '20230519165800-add-superadmin', email: args.email, password: args.password });
  await processSeed({ name: '20230528163620-fill-excel-data' });

  if (fill) {
    await processSeed({ name: '20230528191635-fill-test-users' });
  }
}
