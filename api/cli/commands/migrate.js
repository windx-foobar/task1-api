import { createDatabase, getDatabase } from '@innoagency-arenda/database';

import * as config from 'config';

function getArgsParams(args) {
  const { from = '', to = '' } = args;
  return { from, to };
}

async function process(options = {}) {
  const { from = '', to = '', method = 'up' } = options || {};

  await createDatabase(config.database);

  const { umzug } = getDatabase();

  const migrations = await umzug[method]({ from, to });
  if (!migrations?.length) {
    console.log('Migrations not found.');
  }
}

export async function up(args = {}) {
  try {
    await process({ method: 'up', ...getArgsParams(args) });
  } catch (error) {
    throw error;
  }
}

export async function down(args = {}) {
  try {
    await process({ method: 'down', ...getArgsParams(args) });
  } catch (error) {
    throw error;
  }
}
