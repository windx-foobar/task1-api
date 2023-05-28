import { createServer } from '@innoagency-arenda/server';
import { createDatabase } from '@innoagency-arenda/database';

import * as config from './config';
import { defineRoutes } from './routes';

const databaseConnect = createDatabase(config.database, config.app.isDev);

const app = createServer(config.server.modules, config.app.isDev);
defineRoutes(app);

databaseConnect()
  .then(() => {
    app.listen(config.server.port, config.server.host, () => {
      console.log(
        [
          'Server started',
          `  Access URL: http://${config.server.host}:${config.server.port}`,
          'Press CTRL-C to stop'
        ].join('\n')
      );
    });
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
