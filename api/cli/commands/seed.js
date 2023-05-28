import fs from 'node:fs';
import path from 'node:path';
import { createDatabase } from '@innoagency-arenda/database';

import * as config from 'config';

const resolveSeedsPath = (...paths) => path.resolve(config.database.seedsDir, ...paths);

export async function process(args = {}) {
  const name = args?._?.[1] || args.name;
  if (!name) {
    throw new Error(
      [
        'Please put seed name in argument or option --name.',
        'Example:',
        `  yarn ${config.app.isDev ? 'cli-dev' : 'cli'}:api 20190704102600-add-roles`,
        `  yarn ${config.app.isDev ? 'cli-dev' : 'cli'}:api --name 20190704102600-add-roles`
      ].join('\n')
    );
  }

  const seedPath = resolveSeedsPath(name.endsWith('.js') ? name : `${name}.js`);
  if (!fs.existsSync(seedPath)) {
    throw new Error(['Seed not found.', `Directory: ${seedPath}`].join('\n'));
  }

  createDatabase(config.database);

  await require(seedPath).seed();
}
