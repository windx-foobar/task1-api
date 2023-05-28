const pg = require('pg');
const { Sequelize } = require('sequelize');
const { Umzug, SequelizeStorage } = require('umzug');
const { snakeCase: decamelize, upperFirst } = require('lodash');

const { scanDirForModels } = require('./utils');

let sequelizeMaster;
let models = {};
let umzug;

function createDatabase(config) {
  if (sequelizeMaster) {
    return async () => {};
  }

  // Database setup
  pg.types.setTypeParser(1114, (stringValue) => stringValue); // return TIMESTAMP WITHOUT TIMEZONE as string

  //Store the database connection in our db object
  const sequelize = new Sequelize(config.sequelize);
  // sequelize.options.logging = sql => logger.silly(sql, { tag: 'core:sql' });

  // Convert camelCase fields to underscored
  sequelize.addHook('beforeDefine', (columns, options) => {
    if (config.sequelize.dbPrefix && !options.noPrefix) {
      const tableName = options.tableName ? options.tableName : decamelize(options.name.plural);
      options.tableName = `${config.sequelize.dbPrefix}${tableName}`;
    }

    if (!options.underscoredAttributes) return;
    if (options.timestamps !== false) {
      // Default timestamps options to camelCase names if undefined, but leave false as false:
      const { createdAt = 'createdAt', updatedAt = 'updatedAt', deletedAt = 'deletedAt' } = options;
      Object.assign(options, { createdAt, updatedAt, deletedAt });
      // Add timestamps custom definitions
      Object.assign(
        columns,
        options.createdAt && { [options.createdAt]: { type: Sequelize.DATE, allowNull: false } },
        options.updatedAt && { [options.updatedAt]: { type: Sequelize.DATE, allowNull: false } },
        options.paranoid && options.deletedAt && { [options.deletedAt]: { type: Sequelize.DATE } }
      );
    }
    // Underscore all attributes (including timestamps added above)
    Object.keys(columns).forEach((key) => {
      if (typeof columns[key] !== 'function') {
        columns[key].field = decamelize(key); // eslint-disable-line no-param-reassign
      }
    });
  });

  const tryRequireModel = (path) => {
    if (typeof require(path).default === 'function') {
      return require(path).default;
    } else {
      return require(path);
    }
  };

  scanDirForModels(config.modelsDir).forEach((file) => {
    const model = tryRequireModel(file)(sequelize, Sequelize.DataTypes);

    models[model.name] = model;
  });

  // Migrations setup
  umzug = new Umzug({
    migrations: config.migrations,
    context: sequelize.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize }),
    logger: {
      info(event) {
        console.log(`=== ${upperFirst(event.event)} ${event.name} ===`);
      }
    }
  });

  sequelizeMaster = sequelize;

  Object.keys(models).forEach((modelName) => {
    const model = models[modelName];
    if ('associate' in model) model.associate(models);
  });

  const { NODE_APP_INSTANCE } = process.env;
  return async () => {
    // if (dbKey === appConfig.session.db) {
    await sequelize.authenticate();
    // }
    console.log(`Database connection has been established successfully.`); // eslint-disable-line no-console

    if (!config.migrations) return;
    if (NODE_APP_INSTANCE && NODE_APP_INSTANCE !== '0') return; // pm2 clusters mode: only run jobs once per cluster

    // Run pending migrations
    const migrations = await umzug.up();
    if (migrations.length) {
      console.log('UP-ed migrations:', ...migrations.map((mig) => `\n${mig.file}`)); // eslint-disable-line no-console
    } else {
      console.log('Pending migrations not found'); // eslint-disable-line no-console
    }

    // Check missing indexes on foreign indexes
    /* eslint-disable max-len */
    // const missingIndexes = await sequelize.query(`
    //   WITH indexed_tables AS (
    //       SELECT ns.nspname, t.relname as table_name, i.relname as index_name, array_to_string(array_agg(a.attname), ', ') as column_names, ix.indrelid, string_to_array(ix.indkey::text, ' ')::smallint[] as indkey
    //         FROM pg_class i
    //         JOIN pg_index ix ON i.OID = ix.indrelid
    //         JOIN pg_class t ON ix.indrelid = t.oid
    //         JOIN pg_namespace ns ON ns.oid = t.relnamespace
    //         JOIN pg_attribute a ON a.attrelid = t.oid
    //        WHERE a.attnum = ANY(ix.indkey) and t.relkind = 'r' and nspname not in ('pg_catalog')
    //     GROUP BY ns.nspname, t.relname, i.relname, ix.indrelid, ix.indkey
    //     ORDER BY ns.nspname, t.relname, i.relname, ix.indrelid, ix.indkey
    //   )
    //     SELECT conrelid::regclass, conname, reltuples::bigint
    //       FROM pg_constraint pgc
    //       JOIN pg_class ON (conrelid = pg_class.oid)
    //      WHERE contype = 'f' AND NOT EXISTS (SELECT 1 FROM indexed_tables WHERE indrelid = conrelid AND conkey = indkey OR (array_length(indkey, 1) > 1 AND indkey @> conkey))
    //   ORDER BY reltuples DESC;
    // `, { type: sequelize.QueryTypes.SELECT });
    // /* eslint-enable max-len */
    // if (missingIndexes.length > 0) logger.warn('There ara missing indexes on foreign keys', { tag: 'database' });
  };
}

function getDatabase() {
  if (!sequelizeMaster) throw new Error('Database is not defined. Use "createDatabase" function before.');
  return { Sequelize, sequelize: sequelizeMaster, models, umzug };
}

module.exports = { createDatabase, getDatabase };
